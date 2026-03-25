import { Router } from 'express';
import { getDashboardReport, getAdminReport } from '../controllers/report.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/dashboard', authenticate, getDashboardReport);
router.get('/admin', authenticate, requireAdmin, getAdminReport);
export default router;
