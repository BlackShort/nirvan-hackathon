import { Server } from 'socket.io';
import { saveMessage, CHAT_ROOMS } from '../controllers/chatController.js';

export const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true, 
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Store connected users
  const connectedUsers = new Map(); // socketId -> { userId, username, room }
  const roomUsers = new Map(); // roomName -> Set of userIds

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a chat room
    socket.on('join-room', ({ room, username, userId }) => {
      try {
        // Validate room
        if (!CHAT_ROOMS.includes(room)) {
          socket.emit('error', { message: 'Invalid chat room' });
          return;
        }

        // Leave previous room if any
        const previousUserData = connectedUsers.get(socket.id);
        if (previousUserData) {
          socket.leave(previousUserData.room);
          removeUserFromRoom(previousUserData.userId, previousUserData.room);
        }

        // Join new room
        socket.join(room);
        
        // Store user data
        const userData = { userId, username, room };
        connectedUsers.set(socket.id, userData);
        
        // Add user to room tracking
        if (!roomUsers.has(room)) {
          roomUsers.set(room, new Set());
        }
        roomUsers.get(room).add(userId);

        // Notify room about new user
        socket.to(room).emit('user-joined', {
          userId,
          username,
          message: `${username} joined the room`,
          timestamp: new Date()
        });

        // Send current room users to the joining user
        const currentRoomUsers = Array.from(roomUsers.get(room) || []);
        socket.emit('room-users', { users: currentRoomUsers });

        // Send room users count to all users in room
        io.to(room).emit('room-user-count', { 
          count: currentRoomUsers.length,
          room 
        });

        console.log(`User ${username} (${userId}) joined room: ${room}`);
        
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle sending messages
    socket.on('send-message', async ({ room, message, username, userId }) => {
      try {
        // Validate input
        if (!room || !message || !username || !userId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        if (!CHAT_ROOMS.includes(room)) {
          socket.emit('error', { message: 'Invalid chat room' });
          return;
        }

        if (message.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        if (message.length > 1000) {
          socket.emit('error', { message: 'Message too long (max 1000 characters)' });
          return;
        }

        // Save message to database
        const savedMessage = await saveMessage({
          room,
          message: message.trim(),
          username,
          userId,
          messageType: 'text'
        });

        // Broadcast message to all users in the room
        io.to(room).emit('new-message', {
          id: savedMessage._id,
          room: savedMessage.room,
          message: savedMessage.message,
          username: savedMessage.username,
          userId: savedMessage.userId,
          timestamp: savedMessage.timestamp,
          messageType: savedMessage.messageType
        });

        console.log(`Message sent in ${room} by ${username}: ${message.substring(0, 50)}...`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', ({ room, username }) => {
      socket.to(room).emit('user-typing', { username, typing: true });
    });

    socket.on('typing-stop', ({ room, username }) => {
      socket.to(room).emit('user-typing', { username, typing: false });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userData = connectedUsers.get(socket.id);
      
      if (userData) {
        const { userId, username, room } = userData;
        
        // Remove user from tracking
        removeUserFromRoom(userId, room);
        connectedUsers.delete(socket.id);

        // Notify room about user leaving
        socket.to(room).emit('user-left', {
          userId,
          username,
          message: `${username} left the room`,
          timestamp: new Date()
        });

        // Update room user count
        const remainingUsers = roomUsers.get(room);
        const userCount = remainingUsers ? remainingUsers.size : 0;
        
        io.to(room).emit('room-user-count', { 
          count: userCount,
          room 
        });

        console.log(`User ${username} (${userId}) disconnected from room: ${room}`);
      }

      console.log(`User disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to remove user from room tracking
  function removeUserFromRoom(userId, room) {
    if (roomUsers.has(room)) {
      roomUsers.get(room).delete(userId);
      
      // Clean up empty room sets
      if (roomUsers.get(room).size === 0) {
        roomUsers.delete(room);
      }
    }
  }

  // Periodic cleanup of disconnected users (every 5 minutes)
  setInterval(() => {
    console.log('Active connections:', connectedUsers.size);
    console.log('Active rooms:', Array.from(roomUsers.keys()));
  }, 5 * 60 * 1000);

  return io;
};