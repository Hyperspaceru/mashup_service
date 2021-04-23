import database from '../models'
import { Op } from 'sequelize'

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
                    imagePath: null
                },
                {
                    audioPath: null
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

export default class DownloadQuota {
    constructor() {
        return (async () => {
            this._downloadQuota = 20
            this._quotaAboveAverageLikes = ~~(this._downloadQuota / 2)
            this._quotaBelowAverageLikes = ~~(this._downloadQuota / 2)
            await this.quotaInit()
            this._averageLikes = await calcAverageLikes()
            return this
        })()
    }
    async quotaInit() {
        const downloadedPosts = await database.mashup.findAll({
            where: {
                [Op.and]: [
                    {
                        approve: {
                            [Op.ne]: false
                        }
                    },
                    {
                        imagePath: {
                            [Op.ne]: null
                        }
                    },
                    {
                        audioPath: {
                            [Op.ne]: null
                        }
                    },
                    { youtubeLink: null },
                    { status: null }

                ]

            }
        })
        if (downloadedPosts.length > 0) {
            if (downloadedPosts.length < this._downloadQuota) {
                const averageLikes = getAverageLikes(downloadedPosts)
                const quotaAboveAverageLikes = downloadedPosts.reduce((accum, post) => parseInt(post.likes) > averageLikes ? accum + 1 : accum, 0)
                const quotaBelowAverageLikes = downloadedPosts.reduce((accum, post) => parseInt(post.likes) < averageLikes ? accum + 1 : accum, 0)
                this._downloadQuota = this._downloadQuota - downloadedPosts.length
                this._quotaAboveAverageLikes = this._quotaAboveAverageLikes - quotaAboveAverageLikes
                this._quotaBelowAverageLikes = this._quotaBelowAverageLikes - quotaBelowAverageLikes
            } else {
                this._downloadQuota = 0
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