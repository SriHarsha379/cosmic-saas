import { Router } from 'express';
import { getEvaluationModes, createEvaluation, submitEvaluation, getEvaluationResults, listUserEvaluations } from '../controllers/self-evaluation.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/modes', authenticate, getEvaluationModes);
router.get('/', authenticate, listUserEvaluations);
router.post('/', authenticate, createEvaluation);
router.post('/:id/submit', authenticate, submitEvaluation);
router.get('/:id/results', authenticate, getEvaluationResults);
export default router;
