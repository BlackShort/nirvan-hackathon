import express from 'express';
import { getRoomMessages, getChatRooms, cleanupOldMessages } from '../controllers/chatController.js';

export const chatRouter = express.Router();

// @desc    Get list of all chat rooms
// @route   GET /api/chat/rooms
// @access  Public
chatRouter.get('/rooms', getChatRooms);

// @desc    Get messages for a specific room
// @route   GET /api/chat/:room
// @access  Public
chatRouter.get('/:room', getRoomMessages);

// @desc    Manual cleanup of old messages (admin feature)
// @route   DELETE /api/chat/cleanup
// @access  Public (should be admin only in production)
chatRouter.delete('/cleanup', cleanupOldMessages);