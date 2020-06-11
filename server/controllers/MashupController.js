import MashupService from '../services/MashupService';
import Util from '../utils/Utils';

const util = new Util();

class MashupController {
    static async getAllMashups(req, res) {
        try {
            const allMashup = await MashupService.getAllMashups();
            if (allMashup.length > 0) {
                util.setSuccess(200, 'Mashup retrieved', allMashup);
            } else {
                util.setSuccess(200, 'No mashup found');
            }
            return util.send(res);
        } catch (error) {
            util.setError(400, error);
            return util.send(res);
        }
    }

    static async addMashup(req, res) {
        if (!req.body.title || !req.body.price || !req.body.description) {
            util.setError(400, 'Please provide complete details');
            return util.send(res);
        }
        const newMashup = req.body;
        try {
            const createdMashup = await MashupService.addMashup(newMashup);
            util.setSuccess(201, 'Mashup Added!', createdMashup);
            return util.send(res);
        } catch (error) {
            util.setError(400, error.message);
            return util.send(res);
        }
    }

    static async updateMashup(req, res) {
        const alteredMashup = req.body;
        const { id, groupId } = req.params;
        if (!Number(id) && !Number(groupId)) {
            util.setError(400, 'Please input a valid numeric value');
            return util.send(res);
        }
        try {
            const updatedMashup = await MashupService.updatedMashup(id, groupId, alteredMashup);
            if (!updatedMashup) {
                util.setError(404, `Cannot find mashup with the id: ${id} and groupid ${groupId}`);
            } else {
                util.setSuccess(200, 'mashup updated', updatedMashup);
            }
            return util.send(res);
        } catch (error) {
            util.setError(404, error);
            return util.send(res);
        }
    }
}

export default MashupController;