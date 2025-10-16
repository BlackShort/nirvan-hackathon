# 🚀 Quick Start Guide - Chat System Testing

## Step-by-Step Setup (5 Minutes)

### 1. Start MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: Use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env with your Atlas connection string
```

### 2. Start Backend Server
```bash
cd backend
npm start
```
**Expected Output:**
```
MongoDB Connected: localhost:27017
Server is working on port:5000 in development Mode
Chat system with Socket.IO enabled
```

### 3. Start Frontend Server
```bash
cd frontend  
npm run dev
```
**Expected Output:**
```
VITE ready in 1044 ms
➜ Local: http://localhost:5173/
```

### 4. Test the Chat System

1. **Open Browser:** Go to `http://localhost:5173`
2. **Navigate to Chat:** Click the "Chat" tab
3. **Set Username:** Enter your preferred username
4. **Join Room:** Click on any chat room (e.g., "General")
5. **Send Message:** Type a message and press Enter

### 5. Test Real-Time Features

**Multi-User Testing:**
1. Open multiple browser tabs/windows
2. Use different usernames in each tab
3. Join the same chat room
4. Send messages from different tabs
5. Observe real-time message delivery

**Features to Test:**
- ✅ Message sending and receiving
- ✅ User join/leave notifications
- ✅ Typing indicators
- ✅ User count updates
- ✅ Message persistence (refresh page)

## 🔧 Troubleshooting Quick Fixes

### Backend Issues
```bash
# If MongoDB connection fails
echo "Check if MongoDB is running on port 27017"

# If port 5000 is busy
echo "Change PORT in .env file to different port"

# If dependencies missing
npm install
```

### Frontend Issues
```bash
# If axios/socket.io not found
npm install axios socket.io-client

# If Vite build fails
rm -rf node_modules package-lock.json
npm install

# Clear browser cache and restart
```

### Test Commands
```bash
# Test backend API
curl http://localhost:5000/api/chat/rooms

# Test MongoDB connection
mongo hackathon-chat --eval "db.messages.countDocuments()"
```

## 📱 Demo Scenarios

### Scenario 1: Emergency Room
1. Join "Emergency" room
2. Post urgent help request
3. Switch to another tab/user
4. Respond to the emergency
5. Observe real-time conversation

### Scenario 2: Education Room
1. Join "Education" room  
2. Ask a learning question
3. Multiple users provide answers
4. Test typing indicators
5. Check message persistence

### Scenario 3: Food Help Room
1. Join "Food Help" room
2. Post food sharing offer
3. Others express interest
4. Coordinate through chat
5. Test user count accuracy

## ⚡ Performance Testing

### Load Testing (Optional)
```bash
# Install artillery for load testing
npm install -g artillery

# Create artillery config (test-chat.yml)
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Join rooms and send messages"
    weight: 100
    engine: socketio

# Run load test
artillery run test-chat.yml
```

## 🎯 Expected Behavior

### ✅ Working Features Checklist
- [ ] MongoDB connects successfully
- [ ] Backend server starts on port 5000
- [ ] Frontend loads at localhost:5173
- [ ] Username modal appears on first visit
- [ ] Chat rooms display with stats
- [ ] Users can join rooms
- [ ] Messages send and receive in real-time
- [ ] Typing indicators work
- [ ] User count updates correctly
- [ ] System messages for join/leave
- [ ] Messages persist after page refresh
- [ ] Character counter shows 1000 limit

### 🚨 Common Issues
1. **"MongoDB connection error"** → Start MongoDB service
2. **"Socket connection failed"** → Check backend is running
3. **"Messages not sending"** → Verify both servers are running
4. **"Room stats not loading"** → Check API endpoint response

## 📊 Success Metrics

After testing, you should see:
- **Real-time messaging** between multiple browser tabs
- **Message persistence** in MongoDB
- **Active user tracking** across rooms  
- **Smooth UI transitions** and responsive design
- **Error handling** for invalid inputs

Ready to chat! 🚀💬