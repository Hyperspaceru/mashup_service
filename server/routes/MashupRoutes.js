import { Router } from 'express';
import MashupController from '../controllers/MashupController';

const router = Router();

router.get('/', MashupController.getAllMashups);
router.put('/', MashupController.updateMashups);

export default router;