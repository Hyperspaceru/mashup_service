import { Router } from 'express';
import MashupController from '../controllers/MashupController';

const router = Router();

router.get('/', MashupController.getAllMashups);
router.post('/', MashupController.addMashup);
router.put('/:id/:groupId', MashupController.updateMashup);

export default router;