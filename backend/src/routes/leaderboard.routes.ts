import { Router } from 'express';
import { getLeaderboard, updateScore, getUserRank } from '../controllers/leaderboard.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/', getLeaderboard);
router.post('/score', authenticate, requireAdmin, updateScore);
router.get('/user/:userId', authenticate, getUserRank);
export default router;
