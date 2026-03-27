import { Router } from 'express';
import { getProgressStats, getProgressHistory, getProgressMetrics } from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/stats', authenticate, getProgressStats);
router.get('/history', authenticate, getProgressHistory);
router.get('/metrics', authenticate, getProgressMetrics);
export default router;
