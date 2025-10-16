import React, { useState } from 'react';
import { NETWORK_INFO } from '../config/network';

export const NetworkStatus = () => {
  const [showDetails, setShowDetails] = useState(false);

  const getLocalNetworkUrl = () => {
    // Get your machine's local IP
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Show the network IP that others can use
      return `http://192.168.137.135:${port}`;
    }
    
    return window.location.href;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URL copied to clipboard!');
    });
  };

  if (!showDetails) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors z-50"
      >
        📡 Network Info
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">Network Status</h3>
        <button
          onClick={() => setShowDetails(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-600">Current Access:</p>
          <p className="font-mono text-xs bg-gray-100 p-1 rounded">
            {window.location.href}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Share this URL:</p>
          <div className="flex items-center space-x-2">
            <p className="font-mono text-xs bg-green-100 p-1 rounded flex-1">
              {getLocalNetworkUrl()}
            </p>
            <button
              onClick={() => copyToClipboard(getLocalNetworkUrl())}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
        </div>
        
        <div>
          <p className="text-gray-600">Backend:</p>
          <p className="font-mono text-xs bg-gray-100 p-1 rounded">
            {NETWORK_INFO.apiUrl}
          </p>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${NETWORK_INFO.isNetworkAccess ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-xs text-gray-600">
              {NETWORK_INFO.isNetworkAccess ? 'Network Access' : 'Local Access'}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>💡 Share the green URL with others on your network</p>
          <p>🔒 Make sure Windows Firewall allows the connection</p>
        </div>
      </div>
    </div>
  );
};