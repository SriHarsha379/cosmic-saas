import { Router } from 'express';
import { listJobs, getJob, createJob, updateJob, deleteJob } from '../controllers/job.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/', listJobs);
router.get('/:id', getJob);
router.post('/', authenticate, requireAdmin, createJob);
router.put('/:id', authenticate, requireAdmin, updateJob);
router.delete('/:id', authenticate, requireAdmin, deleteJob);
export default router;
