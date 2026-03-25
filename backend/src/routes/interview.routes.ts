import { Router } from 'express';
import { listInterviews, getInterview, createInterview, updateInterview, getInterviewByLink } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, listInterviews);
router.get('/link/:link', authenticate, getInterviewByLink);
router.get('/:id', authenticate, getInterview);
router.post('/', authenticate, createInterview);
router.put('/:id', authenticate, updateInterview);
export default router;
