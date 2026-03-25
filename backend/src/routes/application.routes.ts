import { Router } from 'express';
import { applyToJob, listApplications, getApplication, updateApplicationStatus, withdrawApplication } from '../controllers/application.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.post('/', authenticate, applyToJob);
router.get('/', authenticate, listApplications);
router.get('/:id', authenticate, getApplication);
router.put('/:id/status', authenticate, requireAdmin, updateApplicationStatus);
router.delete('/:id', authenticate, withdrawApplication);
export default router;
