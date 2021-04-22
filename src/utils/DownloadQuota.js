import database from '../models'

const getAverageLikes = (posts) => {
    const likes = posts.map((post) => post.likes)
    return likes.reduce((prev, curr) => prev + curr, 0) / likes.length;
}

export default class DownloadQuota {
    constructor() {
        this._downloadQuota = 20
        this._quotaAboveAverageLikes = ~~(this._downloadQuota / 2)
        this._quotaBelowAverageLikes = ~~(this._downloadQuota / 2)
        quotaInit()
    }
    quotaInit() {
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
                const quotaAboveAverageLikes = donwloadedPosts.reduce((accum, post) => post.likes > averageLikes ? accum++ : accum)
                const quotaBelowAverageLikes = donwloadedPosts.reduce((accum, post) => post.likes < averageLikes ? accum++ : accum)
                this._downloadQuota = this._downloadQuota - downloadedPosts.length
                this._quotaAboveAverageLikes = _quotaAboveAverageLikes - quotaAboveAverageLikes
                this._quotaBelowAverageLikes = _quotaBelowAverageLikes - quotaBelowAverageLikes
            }else{
                this._downloadQuota = 0
                this._quotaAboveAverageLikes = 0
                this._quotaBelowAverageLikes = 0
            }
        }
    }
    get quotaAboveAverageLikes(){
        return this._quotaAboveAverageLikes        
    }
    get quotaBelowAverageLikes(){
        return this._quotaBelowAverageLikes           
    }
}