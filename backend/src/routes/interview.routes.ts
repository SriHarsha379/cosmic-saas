import { Router } from 'express';
import { listInterviews, getInterview, createInterview, updateInterview } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, listInterviews);
router.get('/:id', authenticate, getInterview);
router.post('/', authenticate, createInterview);
router.put('/:id', authenticate, updateInterview);
export default router;
