import { Router } from 'express';
import { getTestTypes, startVersantTest, submitVersantTest, getVersantTestResults, listUserVersantTests } from '../controllers/versant-test.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/types', authenticate, getTestTypes);
router.get('/my', authenticate, listUserVersantTests);
router.post('/', authenticate, startVersantTest);
router.post('/:id/submit', authenticate, submitVersantTest);
router.get('/:id/results', authenticate, getVersantTestResults);
export default router;
