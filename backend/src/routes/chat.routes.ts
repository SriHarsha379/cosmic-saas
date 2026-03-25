import { Router } from 'express';
import { sendMessage, getChatHistory, getConversation, deleteConversation } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.post('/message', authenticate, sendMessage);
router.get('/history', authenticate, getChatHistory);
router.get('/conversation/:conversationId', authenticate, getConversation);
router.delete('/conversation/:conversationId', authenticate, deleteConversation);
export default router;
