import { Router } from 'express';
import { listActivities, getActivity } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, listActivities);
router.get('/user/:userId', authenticate, listActivities);
router.get('/:id', authenticate, getActivity);
export default router;
