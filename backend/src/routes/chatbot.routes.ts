import { Router } from 'express';
import { createChatbot, sendChatbotMessage, getChatbot, listChatbots } from '../controllers/chatbot.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, listChatbots);
router.post('/', authenticate, createChatbot);
router.get('/:id', authenticate, getChatbot);
router.post('/:id/message', authenticate, sendChatbotMessage);
export default router;
