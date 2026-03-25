import { Router } from 'express';
import { listTests, getTest, createTest, updateTest, deleteTest, submitTest } from '../controllers/test.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, listTests);
router.get('/:id', authenticate, getTest);
router.post('/', authenticate, requireAdmin, createTest);
router.put('/:id', authenticate, requireAdmin, updateTest);
router.delete('/:id', authenticate, requireAdmin, deleteTest);
router.post('/:id/submit', authenticate, submitTest);
export default router;
