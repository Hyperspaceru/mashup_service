import database from '../models';

class MashupService {
    static async getAllMashups() {
        try {
          return await database.Mashup.findAll();
        } catch (error) {
          throw error;
        }
      }
    static async addMashup(newMashup) {
        try {
            return await database.Mashup.create(newMashup);
        } catch (error) {
            throw error;
        }
    }
    static async updateMashup(id, groupId , updateMashup) {
        try {
            const mashupToUpdate = await database.Mashup.findOne({
                where: { id: Number(id),
                groupId:Number(groupId) }
            });

            if (mashupToUpdate) {
                await database.Mashup.update(updateMashup, { where: { id: Number(id),
                groupId:Number(groupId) } });

                return updateMashup;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
}

export default MashupService;