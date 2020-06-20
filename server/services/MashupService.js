import database from '../models';
import { Op } from 'sequelize'
import MashupPage from '../utils/MashupPage'

class MashupService {
    static async getAllMashups(page) {
        try {
            let Mashups = new MashupPage()
            let count = await database.mashup.count()
            let offset = Mashups.pageSize * (page - 1)
            Mashups.mashupCount = count
            Mashups.currentPage = await database.mashup.findAll({ limit: Mashups.pageSize, offset: offset });
            return Mashups
        } catch (error) {
            throw error;
        }
    }
    static async getMashupsForAccept(page) {
        try {
            let Mashups = new MashupPage()
            let count = await database.mashup.count({
                where: {
                    approve: null,
                    youtubeLink: null
                }
            })
            let offset = Mashups.pageSize * (page - 1)
            Mashups.mashupCount = count
            Mashups.currentPage = await database.mashup.findAll(
                {
                    limit: Mashups.pageSize,
                    offset: offset,
                    where: {
                        approve: null,
                        youtubeLink: null
                    },
                    order:[['likes','desc']]
                })
            return Mashups
        } catch (error) {
            throw error;
        }
    }
    static async getMashupsDeny(page) {
        try {
            let Mashups = new MashupPage()
            let count = await database.mashup.count({
                where: {
                    approve: false
                }
            })
            let offset = Mashups.pageSize * (page - 1)
            Mashups.mashupCount = count
            Mashups.currentPage = await database.mashup.findAll(
                {
                    limit: Mashups.pageSize,
                    offset: offset,
                    where: {
                        approve: false
                    },
                    order:[
                        ['postDate','desc']]
                })
            return Mashups
        } catch (error) {
            throw error;
        }
    }
    static async getMashupsError(page) {
        try {
            let Mashups = new MashupPage()
            let count = await database.mashup.count({
                where: {
                    status: {
                        [Op.ne]: null
                    }
                }
            })
            let offset = Mashups.pageSize * (page - 1)
            Mashups.mashupCount = count
            Mashups.currentPage = await database.mashup.findAll(
                {
                    limit: Mashups.pageSize,
                    offset: offset,
                    where: {
                        status: {
                            [Op.ne]: null
                        }
                    }
                })
            return Mashups
        } catch (error) {
            throw error;
        }
    }
    static async getMashupsAccepted(page) {
        try {
            let Mashups = new MashupPage()
            let count = await database.mashup.count({
                where: {
                    approve: true,
                    youtubeLink: null
                }
            })
            let offset = Mashups.pageSize * (page - 1)
            Mashups.mashupCount = count
            Mashups.currentPage = await database.mashup.findAll(
                {
                    limit: Mashups.pageSize,
                    offset: offset,
                    where: {
                        approve: true,
                        youtubeLink: null
                    },
                    order:[
                        ['postDate','desc']]
                })
            return Mashups
        } catch (error) {
            throw error;
        }
    }
    static async getMashupsDone(page) {
        try {
            let Mashups = new MashupPage()
            let count = await database.mashup.count({
                where: {
                    status: null,
                    youtubeLink: {
                        [Op.ne]: null
                    }
                }
            })
            let offset = Mashups.pageSize * (page - 1)
            Mashups.mashupCount = count
            Mashups.currentPage = await database.mashup.findAll(
                {
                    limit: Mashups.pageSize,
                    offset: offset,
                    where: {
                        status: null,
                        youtubeLink: {
                            [Op.ne]: null
                        }
                    }

                })
            return Mashups
        } catch (error) {
            throw error;
        }
    }
    static async updateMashup(id, publicId, updateMashup) {
        try {
            const mashupToUpdate = await database.mashup.findOne({
                where: {
                    id: Number(id),
                    publicId: Number(publicId)
                }
            });

            if (mashupToUpdate) {
                await database.mashup.update(updateMashup, {
                    where: {
                        id: Number(id),
                        publicId: Number(publicId)
                    }
                });

                return updateMashup;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
}

export default MashupService;