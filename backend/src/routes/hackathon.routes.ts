import { Router } from 'express';
import { listHackathons, getHackathon, createHackathon, updateHackathon, deleteHackathon, joinHackathon, leaveHackathon } from '../controllers/hackathon.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/', listHackathons);
router.get('/:id', getHackathon);
router.post('/', authenticate, requireAdmin, createHackathon);
router.put('/:id', authenticate, requireAdmin, updateHackathon);
router.delete('/:id', authenticate, requireAdmin, deleteHackathon);
router.post('/:id/join', authenticate, joinHackathon);
router.delete('/:id/leave', authenticate, leaveHackathon);
export default router;
