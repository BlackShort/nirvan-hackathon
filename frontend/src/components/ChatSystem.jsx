import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { ChatRoom } from './ChatRoom';
import { API_BASE_URL, SOCKET_URL } from '../config/network';

export const ChatSystem = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [socket, setSocket] = useState(null);
  const [showUsernameModal, setShowUsernameModal] = useState(true);

  // Generate unique user ID
  useEffect(() => {
    const storedUserId = localStorage.getItem('chat-user-id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chat-user-id', newUserId);
      setUserId(newUserId);
    }

    const storedUsername = localStorage.getItem('chat-username');
    if (storedUsername) {
      setUsername(storedUsername);
      setShowUsernameModal(false);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (username && userId) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [username, userId]);

  // Fetch available chat rooms
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/rooms`);
      setRooms(response.data.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // Refresh rooms every 30 seconds
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle username submission
  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername.length >= 2) {
      localStorage.setItem('chat-username', trimmedUsername);
      setUsername(trimmedUsername);
      setShowUsernameModal(false);
    }
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

  // Get room color
  const getRoomColor = (roomName) => {
    const colors = {
      'Emergency': 'from-red-500 to-red-600',
      'Food Help': 'from-green-500 to-green-600',
      'Education': 'from-blue-500 to-blue-600',
      'Help': 'from-purple-500 to-purple-600',
      'General': 'from-gray-500 to-gray-600'
    };
    return colors[roomName] || 'from-gray-500 to-gray-600';
  };

  // Username Modal
  if (showUsernameModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Chat</h2>
          <p className="text-gray-600 mb-6">Enter your username to start chatting with the community</p>
          
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full p-3 text-neutral-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minLength={2}
              maxLength={20}
              required
            />
            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Start Chatting
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Chat room view
  if (selectedRoom && socket) {
    return (
      <ChatRoom
        room={selectedRoom}
        username={username}
        userId={userId}
        socket={socket}
        onLeaveRoom={() => setSelectedRoom(null)}
      />
    );
  }

  // Room selection view
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Community Chat Rooms
        </h2>
        <p className="text-gray-600">
          Welcome, <span className="font-semibold">{username}</span>! Choose a room to start chatting.
        </p>
      </div>

      {/* User info bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-gray-900">{username}</span>
        </div>
        
        <button
          onClick={() => {
            localStorage.removeItem('chat-username');
            setShowUsernameModal(true);
          }}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Change Username
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading chat rooms...</span>
          </div>
        </div>
      )}

      {/* Chat rooms grid */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div
              key={room.name}
              onClick={() => setSelectedRoom(room.name)}
              className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 group"
            >
              {/* Room header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getRoomColor(room.name)} rounded-lg flex items-center justify-center text-xl`}>
                  {getRoomIcon(room.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-500">{room.description}</p>
                </div>
              </div>

              {/* Room stats */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium text-green-600">{room.activeUsers}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Messages</span>
                  <span className="font-medium text-blue-600">{room.messageCount}</span>
                </div>
              </div>

              {/* Latest message preview */}
              {room.latestMessage && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">
                    <span className="font-medium">{room.latestMessage.username}:</span>
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {room.latestMessage.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(room.latestMessage.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {/* Join button */}
              <button className="w-full mt-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && rooms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-600 text-lg">No chat rooms available</p>
          <p className="text-gray-500 text-sm">Check back later or contact support.</p>
        </div>
      )}

      {/* Refresh button */}
      <div className="flex justify-center">
        <button
          onClick={fetchRooms}
          disabled={isLoading}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Rooms'}
        </button>
      </div>
    </div>
  );
};