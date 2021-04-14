import database from '../models';
import moment from 'moment'

const dateFormat = "YYYY-MM-DD"

const updateQuotaInDB = (quota) => {
    database.mashupSchedule.update({
        dailyQuota: quota.dailyQuota,
        dailyQuotaLimit: quota.dailyQuotaLimit,
        uploadLimitExceeded: quota.uploadLimitExceeded
    }, {
        where: {
            date: quota.date
        }
    })
}



export default class Quota {
    constructor() {
        this._dailyQuotaLimit = 50
        this._uploadLimitExceeded = false
        this._dailyQuota = 0
        // this.chunkSize = 5
        this._date = new Date()
    }
    get dailyQuota() {
        return this._dailyQuota
    }
    set dailyQuota(value) {
        this._dailyQuota = value
    }
    incrementDailyQuota() {
        this._dailyQuota += 1
        updateQuotaInDB(this)
    }
    getDateTimestamp() {
        return this._date()
    }
    get date() {
        return moment(this._date).format(dateFormat)
    }
    get prevDate() {
        return moment(this._date).subtract(1, 'days').format(dateFormat)
    }
    set date(timestamp) {
        this._date = timestamp
        this.initQuota()
    }
    get dailyQuotaLimit() {
        return this._dailyQuotaLimit
    }
    set dailyQuotaLimit(value) {
        this._dailyQuotaLimit = value
    }
    set uploadLimitExceeded(value) {
        this._uploadLimitExceeded = value
        updateQuotaInDB(this)
    }
    initQuota() {
        console.log("")
        database.mashupSchedule.findOne(
            {
                where: {
                    date: this.prevDate
                }
            }
        ).then((prevSchedule) => {
            if (prevSchedule) {
                this.dailyQuotaLimit = prevSchedule.dailyQuotaLimit
                if (prevSchedule.uploadLimitExceeded) {
                    this.dailyQuotaLimit += 5
                } else {
                    this.dailyQuotaLimit -= 5
                }
            }
            let date = this.date
            database.mashupSchedule.findOne(
                {
                    where: {
                        date: date
                    }
                }
            ).then((schedule) => {
                if (schedule) {
                    this.dailyQuota = schedule.dailyQuota
                    this.dailyQuotaLimit = schedule.dailyQuotaLimit
                    this.uploadLimitExceeded = schedule.uploadLimitExceeded
                }

                let dailyQuota = this.dailyQuota
                let dailyQuotaLimit = this.dailyQuotaLimit
                let uploadLimitExceeded = this.uploadLimitExceeded
                if (!schedule) {
                    database.mashupSchedule.create({
                        date: date,
                        dailyQuota: dailyQuota,
                        dailyQuotaLimit: dailyQuotaLimit,
                        uploadLimitExceeded: uploadLimitExceeded
                    }).then(() => { console.log('Create today schedule') })
                }

            })

        })
    }
}