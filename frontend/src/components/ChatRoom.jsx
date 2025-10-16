import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const ChatRoom = ({ room, username, userId, socket, onLeaveRoom }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Join room and fetch initial messages
  useEffect(() => {
    if (socket && room) {
      // Fetch messages from API
      const fetchMessages = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/chat/${room}`);
          setMessages(response.data.data.messages);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setIsLoading(false);
        }
      };

      // Socket event handlers
      const handleNewMessage = (message) => {
        setMessages(prev => [...prev, message]);
      };

      const handleUserJoined = (data) => {
        setMessages(prev => [...prev, {
          id: 'system-' + Date.now(),
          messageType: 'system',
          message: data.message,
          timestamp: data.timestamp,
          username: 'System'
        }]);
      };

      const handleUserLeft = (data) => {
        setMessages(prev => [...prev, {
          id: 'system-' + Date.now(),
          messageType: 'system',
          message: data.message,
          timestamp: data.timestamp,
          username: 'System'
        }]);
      };

      const handleUserCountUpdate = (data) => {
        setUserCount(data.count);
      };

      const handleUserTyping = (data) => {
        if (data.username !== username) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (data.typing) {
              newSet.add(data.username);
            } else {
              newSet.delete(data.username);
            }
            return newSet;
          });
        }
      };

      const handleSocketError = (error) => {
        console.error('Socket error:', error);
        alert(error.message || 'An error occurred');
      };

      // Join the room
      socket.emit('join-room', { room, username, userId });

      // Fetch initial messages
      fetchMessages();

      // Set up socket listeners
      socket.on('new-message', handleNewMessage);
      socket.on('user-joined', handleUserJoined);
      socket.on('user-left', handleUserLeft);
      socket.on('room-user-count', handleUserCountUpdate);
      socket.on('user-typing', handleUserTyping);
      socket.on('error', handleSocketError);

      return () => {
        socket.off('new-message');
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('room-user-count');
        socket.off('user-typing');
        socket.off('error');
      };
    }
  }, [socket, room, username, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', {
      room,
      message: newMessage.trim(),
      username,
      userId
    });

    setNewMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      socket.emit('typing-stop', { room, username });
      setIsTyping(false);
    }
  };

  // Handle typing
  const handleTyping = (value) => {
    setNewMessage(value);

    if (!socket) return;

    // Start typing indicator
    if (!isTyping && value.trim()) {
      socket.emit('typing-start', { room, username });
      setIsTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        socket.emit('typing-stop', { room, username });
        setIsTyping(false);
      }
    }, 2000);
  };

  // Get room icon
  const getRoomIcon = (roomName) => {
    const icons = {
      'Emergency': '🚨',
      'Food Help': '🍽️',
      'Education': '📚',
      'Help': '🤝',
      'General': '💬'
    };
    return icons[roomName] || '💬';
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get message background color
  const getMessageBg = (messageUserId) => {
    return messageUserId === userId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900';
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onLeaveRoom}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-2xl">{getRoomIcon(room)}</div>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{room}</h1>
            <p className="text-sm text-gray-500">
              {userCount} user{userCount !== 1 ? 's' : ''} online
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Connected</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading messages...</span>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id || message._id}
                className={`flex ${
                  message.messageType === 'system'
                    ? 'justify-center'
                    : message.userId === userId
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                {message.messageType === 'system' ? (
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    {message.message}
                  </div>
                ) : (
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageBg(
                      message.userId
                    )}`}
                  >
                    {message.userId !== userId && (
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        {message.username}
                      </p>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.userId === userId ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={`Message ${room}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        
        {/* Character counter */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            Press Enter to send
          </p>
          <p className="text-xs text-gray-500">
            {newMessage.length}/1000
          </p>
        </div>
      </div>
    </div>
  );
};