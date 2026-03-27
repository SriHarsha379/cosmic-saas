import { Router } from 'express';
import { listTeams, getTeam, createTeam, updateTeam, deleteTeam, requestJoin, respondJoinRequest, removeMember } from '../controllers/team.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, listTeams);
router.get('/:id', authenticate, getTeam);
router.post('/', authenticate, requireAdmin, createTeam);
router.put('/:id', authenticate, requireAdmin, updateTeam);
router.delete('/:id', authenticate, requireAdmin, deleteTeam);
router.post('/:id/join', authenticate, requestJoin);
router.put('/requests/:requestId', authenticate, respondJoinRequest);
router.delete('/:id/members/:userId', authenticate, removeMember);
export default router;
