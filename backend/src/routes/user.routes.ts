import { Router } from 'express';
import { getProfile, updateProfile, listUsers, deleteUser } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, requireAdmin, listUsers);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/:id', authenticate, getProfile);
router.delete('/:id', authenticate, requireAdmin, deleteUser);
export default router;
