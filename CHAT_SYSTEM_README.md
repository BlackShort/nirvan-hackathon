# 🚀 Real-Time Chat System Documentation

## 📋 Overview

This application features a complete real-time chat system with public chat rooms, built using Node.js, Express, Socket.IO, MongoDB, and React. The system supports multiple chat rooms with automatic message expiration and real-time communication.

## 🎯 Features

### 🏠 Chat Rooms
- **Emergency** 🚨 - Urgent help and emergency situations
- **Food Help** 🍽️ - Food assistance and meal sharing
- **Education** 📚 - Learning resources and educational support
- **Help** 🤝 - General help and community assistance
- **General** 💬 - Open discussion and community chat

### ⚡ Real-Time Features
- **Instant Messaging** - Messages appear immediately for all users
- **Typing Indicators** - See when others are typing
- **User Presence** - Live user count and join/leave notifications
- **Message History** - Persistent message storage with pagination
- **Auto-Scroll** - Automatically scroll to new messages

### 🔒 Data Management
- **Automatic Message Deletion** - Messages expire after 7 days
- **MongoDB TTL Indexes** - Efficient automatic cleanup
- **Message Validation** - Length limits and content filtering
- **User Identification** - Persistent user sessions

## 🛠️ Technical Architecture

### Backend Stack
```
├── Express.js Server
├── Socket.IO for Real-time Communication
├── MongoDB with Mongoose ODM
├── CORS Configuration
└── RESTful API Endpoints
```

### Frontend Stack
```
├── React.js with Hooks
├── Socket.IO Client
├── Axios for HTTP Requests
├── Tailwind CSS for Styling
└── Real-time State Management
```

### Database Schema
```javascript
{
  room: String (enum: ['Emergency', 'Food Help', 'Education', 'Help', 'General'])
  username: String (max: 50 characters)
  message: String (max: 1000 characters)
  timestamp: Date (auto-generated, TTL: 7 days)
  userId: String (unique identifier)
  messageType: String (enum: ['text', 'system'])
}
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install mongoose socket.io express cors dotenv cookie-parser
   ```

2. **Environment Configuration**
   Create/update `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/hackathon-chat
   ```

3. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud service
   ```

4. **Start Backend Server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install socket.io-client axios
   ```

2. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```

### Database Setup

MongoDB will automatically create collections and indexes when the application starts. The TTL (Time To Live) index ensures messages older than 7 days are automatically deleted.

## 📡 API Endpoints

### REST API
```http
GET    /api/chat/rooms           # Get all chat rooms with activity stats
GET    /api/chat/:room           # Get messages for specific room (paginated)
DELETE /api/chat/cleanup         # Manual cleanup of old messages (admin)
```

### Socket.IO Events

#### Client → Server
```javascript
// Join a chat room
socket.emit('join-room', { room, username, userId })

// Send a message
socket.emit('send-message', { room, message, username, userId })

// Typing indicators
socket.emit('typing-start', { room, username })
socket.emit('typing-stop', { room, username })
```

#### Server → Client
```javascript
// New message received
socket.on('new-message', (message) => {})

// User joined/left room
socket.on('user-joined', (data) => {})
socket.on('user-left', (data) => {})

// Room statistics
socket.on('room-user-count', ({ count, room }) => {})

// Typing indicators
socket.on('user-typing', ({ username, typing }) => {})

// Error handling
socket.on('error', (error) => {})
```

## 🎨 User Interface

### Room Selection
- **Grid Layout** - Visual chat room cards with stats
- **Room Information** - User count, message count, latest activity
- **Join Animation** - Smooth hover effects and transitions

### Chat Interface
- **Message Bubbles** - Different colors for sent/received messages
- **System Messages** - Join/leave notifications
- **Typing Indicators** - Real-time typing status
- **Timestamps** - Message time formatting
- **Character Counter** - 1000 character limit with visual feedback

### Responsive Design
- **Mobile Friendly** - Optimized for all screen sizes
- **Touch Interactions** - Mobile-first input handling
- **Adaptive Layout** - Flexible message container sizing

## 🔧 Configuration Options

### Message Expiration
```javascript
// In Message.js schema
expireAfterSeconds: 7 * 24 * 60 * 60 // 7 days
```

### Room Configuration
```javascript
// In chatController.js
export const CHAT_ROOMS = ['Emergency', 'Food Help', 'Education', 'Help', 'General'];
```

### Socket.IO Settings
```javascript
// CORS configuration
cors: {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true
}
```

## 🛡️ Security Features

### Input Validation
- **Message Length** - Maximum 1000 characters
- **Username Length** - Maximum 50 characters
- **Room Validation** - Only predefined rooms allowed
- **XSS Prevention** - Input sanitization

### Rate Limiting (Recommended)
```javascript
// Add to server.js for production
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/chat', limiter);
```

## 📊 Monitoring & Analytics

### Database Indexes
```javascript
// Compound index for efficient queries
{ room: 1, timestamp: -1 }

// TTL index for automatic deletion
{ timestamp: 1 }, { expireAfterSeconds: 604800 }
```

### Performance Considerations
- **Message Pagination** - Limit 50 messages per request
- **Connection Limits** - Monitor concurrent Socket.IO connections
- **Memory Usage** - Track active room/user mappings

## 🔄 Data Flow

### Message Sending Flow
1. User types message in React component
2. Form submission triggers `send-message` socket event
3. Backend validates message and saves to MongoDB
4. Message broadcast to all users in the room
5. React components update with new message

### Room Management Flow
1. User selects room from room list
2. Socket emits `join-room` event
3. Backend adds user to room tracking
4. Fetch initial message history via REST API
5. Real-time updates via Socket.IO events

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB status
mongo --eval "db.adminCommand('ismaster')"

# Restart MongoDB service
sudo systemctl restart mongod
```

**Socket.IO Connection Issues**
```javascript
// Check browser console for errors
// Verify CORS configuration matches frontend URL
// Ensure backend server is running on correct port
```

**Messages Not Persisting**
```javascript
// Verify MongoDB connection in backend logs
// Check for validation errors in message schema
// Ensure proper error handling in saveMessage function
```

## 🚀 Production Deployment

### Environment Variables
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chat
```

### Security Enhancements
- Enable HTTPS/WSS for encrypted connections
- Implement user authentication and authorization
- Add rate limiting and DDoS protection
- Set up proper CORS policies
- Enable MongoDB authentication

### Scaling Considerations
- Use Redis for Socket.IO adapter in multi-server setup
- Implement horizontal scaling with load balancers
- Consider message archiving for high-volume rooms
- Monitor database performance and add indexes as needed

## 📈 Future Enhancements

### Planned Features
- **File Sharing** - Upload and share images/documents
- **Private Messaging** - Direct user-to-user communication
- **Message Reactions** - Emoji reactions to messages
- **User Profiles** - Avatar and bio management
- **Moderation Tools** - Admin controls and message filtering
- **Push Notifications** - Browser notifications for new messages

### Technical Improvements
- **Message Search** - Full-text search across message history
- **Message Threading** - Reply to specific messages
- **Voice Messages** - Audio message support
- **Video Chat** - WebRTC integration for video calls
- **Translation** - Multi-language support

## 📞 Support

For issues or questions about the chat system:
1. Check the troubleshooting section above
2. Review server and browser console logs
3. Verify MongoDB connection and data persistence
4. Test Socket.IO connectivity in browser dev tools

## 📄 License

This chat system is part of the hackathon project and is available under the MIT License.

---

**Happy Chatting! 💬🚀**