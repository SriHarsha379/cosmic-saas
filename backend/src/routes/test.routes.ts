import { Router } from 'express';
import {
  listTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  startTest,
  submitTest,
  getTestResults,
  getTestResult
} from '../controllers/test.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Results routes MUST come before /:id
router.get('/results', authenticate, getTestResults);
router.get('/results/:resultId', authenticate, getTestResult);

// Public routes
router.get('/', listTests);
router.get('/:id', getTest);

// Authenticated routes
router.post('/', authenticate, requireAdmin, createTest);
router.put('/:id', authenticate, requireAdmin, updateTest);
router.delete('/:id', authenticate, requireAdmin, deleteTest);
router.post('/:id/start', authenticate, startTest);
router.post('/:id/submit', authenticate, submitTest);

export default router;
