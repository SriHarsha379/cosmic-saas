import { Router } from 'express';
import { sendTeamMessage, getTeamMessages, deleteMessage } from '../controllers/team-chat.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/team-chat/:teamId/message - Send a message
router.post('/:teamId/message', authenticate, sendTeamMessage);

// GET /api/team-chat/:teamId/messages - Get all messages for a team
router.get('/:teamId/messages', authenticate, getTeamMessages);

// DELETE /api/team-chat/message/:messageId - Delete a message
router.delete('/message/:messageId', authenticate, deleteMessage);

export default router;
