import MashupService from '../services/MashupService';
import Util from '../utils/Utils';

const util = new Util();

class MashupController {
    static async getAllMashups(req, res) {
        try {
            const page = req.query.page;
            const type = req.query.type?req.query.type:"all";
            let resultMashups = []
            switch (type){
                case "deny":
                    resultMashups = await MashupService.getMashupsDeny(page);
                    break;
                case "accept":
                    resultMashups = await MashupService.getMashupsAccepted(page);
                    break;
                case "error":
                    resultMashups = await MashupService.getMashupsError(page);
                    break;
                case "wait":
                    resultMashups = await MashupService.getMashupsForAccept(page);
                    break;
                case "done":
                    resultMashups = await MashupService.getMashupsDone(page);                    
                    break;
                case "all":
                default:
                    resultMashups = await MashupService.getAllMashups(page);
            }
            if (resultMashups.length > 0) {
                util.setSuccess(200, 'Mashup retrieved', resultMashups  );
            } else {
                util.setSuccess(200, 'No mashup found');
            }
            return util.send(res);
        } catch (error) {
            util.setError(400, error);
            return util.send(res);
        }
    }

    static async updateMashups(req, res) {
        const alteredMashups = req.body;
        try {
        await alteredMashups.forEach((mashup)=>{
            let id = mashup.id
            let publicId = mashup.publicId
            if (!Number(id) && !Number(publicId)) {
                util.setError(400, 'Please input a valid numeric value');
                return util.send(res);
            }
        })
       await alteredMashups.forEach(async (mashup)=>{
            let id = mashup.id
            let publicId = mashup.publicId
            const updatedMashup = await MashupService.updateMashup(id, publicId, mashup);
            if (!updatedMashup) {
                util.setError(404, `Cannot find mashup with the id: ${id} and publicId ${publicId}`);
                return util.send(res);
            } else {
                util.setSuccess(200, 'mashup updated', updatedMashup);
            }            
        })
            return util.send(res);
        } catch (error) {
            util.setError(404, error);
            return util.send(res);
        }
    }
}

export default MashupController;