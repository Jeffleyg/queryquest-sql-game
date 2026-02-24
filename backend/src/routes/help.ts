import { Router } from 'express';
import { getExamples, getManual, getMissionHints, getQueryTemplate } from '../controllers/helpController';

const router = Router();

router.get('/examples', getExamples);
router.get('/manual', getManual);
router.get('/hints', getMissionHints);
router.get('/template/:missionId', getQueryTemplate);

export default router;
