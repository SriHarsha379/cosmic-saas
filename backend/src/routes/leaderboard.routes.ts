import { Router } from 'express';
import { getLeaderboard, updateScore, getUserRank } from '../controllers/leaderboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get global leaderboard
router.get('/', getLeaderboard);

// Get current user's rank (must come BEFORE /:userId)
router.get('/me', authenticate, getUserRank);

// Update score
router.post('/score', authenticate, updateScore);

// Get specific user's rank
router.get('/:userId', authenticate, getUserRank);

export default router;
