import { Router } from 'express';
import { getProfile, updateProfile, listUsers, deleteUser } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/profile', authenticate, getProfile);           // ✅ Specific routes first
router.put('/profile', authenticate, updateProfile);
router.get('/', authenticate, requireAdmin, listUsers);    // ✅ General routes last
router.get('/:id', authenticate, getProfile);
router.delete('/:id', authenticate, requireAdmin, deleteUser);
export default router;