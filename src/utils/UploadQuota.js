import database from '../models'
import moment from 'moment'
import { Op } from 'sequelize'

const dateFormat = "YYYY-MM-DD"

const getAverageLikes = (posts) => {
    const likes = posts.map((post) => post.likes)
    return likes.reduce((prev, curr) => prev + curr, 0) / likes.length;
}

const calcAverageLikes = async () => {
    const approvedPosts = await database.mashup.findAll({
        where: {
            [Op.and]: [
                {
                    approve: true
                },
                {
                    videoPath: {
                        [Op.ne]: null
                    }
                },
                { youtubeLink: null },
                { status: null }

            ]

        }
    })
    if (approvedPosts.length > 0) {
        return getAverageLikes(approvedPosts)
    } else {
        return 0
    }
}

export default class UploadQuota {
    constructor() {
        return (async () => {
        this._uploadQuota = 20
        this._quotaAboveAverageLikes = ~~(this._uploadQuota / 2)
        this._quotaBelowAverageLikes = ~~(this._uploadQuota / 2)
        this._date = moment(new Date()).format(dateFormat)
            await this.quotaInit()
            this._averageLikes = await calcAverageLikes()
            return this
        })()
    }
    async quotaInit() {
        const uploadedPosts = await database.mashup.findAll({
            where: {
                [Op.and]: [                    
                    {
                        youtubeLink: {
                            [Op.ne]: null
                        }
                    },
                    { youtubeUploadDate: this._date }
                ]
            }
        })
        if (uploadedPosts.length > 0) {
            if (uploadedPosts.length < this._uploadQuota) {
                const averageLikes = getAverageLikes(uploadedPosts)
                const quotaAboveAverageLikes = uploadedPosts.reduce((accum, post) => post.likes > averageLikes ? accum+1 : accum,0)
                const quotaBelowAverageLikes = uploadedPosts.reduce((accum, post) => post.likes < averageLikes ? accum+1 : accum,0)
                this._uploadQuota = this._uploadQuota - uploadedPosts.length
                this._quotaAboveAverageLikes = this._quotaAboveAverageLikes - quotaAboveAverageLikes
                this._quotaBelowAverageLikes = this._quotaBelowAverageLikes - quotaBelowAverageLikes
            }else{
                this._uploadQuota = 0
                this._quotaAboveAverageLikes = 0
                this._quotaBelowAverageLikes = 0
            }
        }
    }
    get quotaAboveAverageLikes() {
        return this._quotaAboveAverageLikes        
    }
    get quotaBelowAverageLikes() {
        return this._quotaBelowAverageLikes           
    }
    get averageLikes() {
        return this._averageLikes
    }
}