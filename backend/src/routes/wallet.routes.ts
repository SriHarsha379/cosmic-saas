import { Router } from 'express';
import { getWallet, addFunds, deductFunds, getTransactions } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, getWallet);
router.post('/add-funds', authenticate, addFunds);
router.post('/deduct-funds', authenticate, deductFunds);
router.get('/transactions', authenticate, getTransactions);
export default router;
