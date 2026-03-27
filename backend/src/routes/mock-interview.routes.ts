import { Router } from 'express';
import { listInterviewTypes, startMockInterview, submitMockInterview, getMockInterviewResults, listUserMockInterviews } from '../controllers/mock-interview.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/my', authenticate, listUserMockInterviews);
router.get('/', authenticate, listInterviewTypes);
router.post('/', authenticate, startMockInterview);
router.post('/:id/submit', authenticate, submitMockInterview);
router.get('/:id/results', authenticate, getMockInterviewResults);
export default router;
