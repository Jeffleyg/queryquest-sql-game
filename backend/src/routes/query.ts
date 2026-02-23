import { Router } from 'express';
import { executeUserQuery } from '../controllers/queryController';

const router = Router();

router.post('/', executeUserQuery);

export default router;
