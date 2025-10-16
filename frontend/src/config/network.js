// Get the current host and determine backend URL
const getHostIP = () => {
  // If running on localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'localhost';
  }
  // Otherwise, assume we're accessing from network and the backend is on the same IP
  return window.location.hostname;
};

// Dynamic API base URL
export const API_BASE_URL = `http://${getHostIP()}:5000`;

// Socket.IO URL
export const SOCKET_URL = `http://${getHostIP()}:5000`;

// Network information for sharing
export const NETWORK_INFO = {
  currentHost: window.location.hostname,
  currentPort: window.location.port,
  apiUrl: API_BASE_URL,
  socketUrl: SOCKET_URL,
  isNetworkAccess: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
};

console.log('Network Configuration:', NETWORK_INFO);