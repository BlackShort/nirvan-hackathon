import { Message } from '../models/Message.js';

// Available chat rooms
export const CHAT_ROOMS = ['Emergency', 'Food Help', 'Education', 'Help', 'General'];

// @desc    Get messages for a specific room
// @route   GET /api/chat/:room
// @access  Public
export const getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate room
    if (!CHAT_ROOMS.includes(room)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat room'
      });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get messages for the room (latest first)
    const messages = await Message.find({ room })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Reverse to show chronological order (oldest first)
    messages.reverse();

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({ room });
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasMore: skip + messages.length < totalMessages
        },
        room
      }
    });

  } catch (error) {
    console.error('Error fetching room messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// @desc    Get list of available chat rooms with recent activity
// @route   GET /api/chat/rooms
// @access  Public
export const getChatRooms = async (req, res) => {
  try {
    const roomsWithActivity = await Promise.all(
      CHAT_ROOMS.map(async (room) => {
        // Get the latest message for each room
        const latestMessage = await Message.findOne({ room })
          .sort({ timestamp: -1 })
          .lean();

        // Get message count for each room
        const messageCount = await Message.countDocuments({ room });

        // Get active users in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentUsers = await Message.distinct('userId', {
          room,
          timestamp: { $gte: oneHourAgo }
        });

        return {
          name: room,
          latestMessage: latestMessage ? {
            message: latestMessage.message.substring(0, 100),
            username: latestMessage.username,
            timestamp: latestMessage.timestamp
          } : null,
          messageCount,
          activeUsers: recentUsers.length,
          description: getRoomDescription(room)
        };
      })
    );

    res.json({
      success: true,
      data: {
        rooms: roomsWithActivity
      }
    });

  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat rooms',
      error: error.message
    });
  }
};

// @desc    Save a new message (used by socket.io)
export const saveMessage = async (messageData) => {
  try {
    const message = new Message({
      room: messageData.room,
      username: messageData.username,
      message: messageData.message,
      userId: messageData.userId,
      messageType: messageData.messageType || 'text'
    });

    const savedMessage = await message.save();
    return savedMessage.toObject();
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// @desc    Delete old messages (cleanup function)
// @route   DELETE /api/chat/cleanup
// @access  Admin (for manual cleanup if needed)
export const cleanupOldMessages = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await Message.deleteMany({
      timestamp: { $lt: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
        message: `Deleted ${result.deletedCount} old messages`
      }
    });

  } catch (error) {
    console.error('Error cleaning up messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup messages',
      error: error.message
    });
  }
};

// Helper function to get room descriptions
function getRoomDescription(room) {
  const descriptions = {
    'Emergency': 'Urgent help and emergency situations',
    'Food Help': 'Food assistance and meal sharing',
    'Education': 'Learning resources and educational support',
    'Help': 'General help and community assistance',
    'General': 'Open discussion and community chat'
  };
  
  return descriptions[room] || 'Community discussion';
}