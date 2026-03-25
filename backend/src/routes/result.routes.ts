import { Router } from 'express';
import { listResults, getResult, getMyResults } from '../controllers/result.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, listResults);
router.get('/me', authenticate, getMyResults);
router.get('/:id', authenticate, getResult);
export default router;
