import React, { useState } from 'react';
import { API_BASE_URL } from '../config/network';

export const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    const currentQuery = searchTerm;
    setSearchTerm('');
    setIsLoading(true);

    // Add user query to chat
    setChatHistory(prev => [...prev, { type: 'query', content: currentQuery }]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: currentQuery })
      });
      const data = await response.json();

      // Add answer to chat
      setChatHistory(prev => [...prev, { type: 'answer', content: data.answer || 'No answer found' }]);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setChatHistory(prev => [...prev, { type: 'answer', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasStartedChat = chatHistory.length > 0;

  return (
    <div className={`w-full flex flex-col px-4 mx-auto transition-all duration-500 ${hasStartedChat ? 'max-w-4xl min-h-screen' : 'max-w-6xl items-center justify-center'}`}>

      {/* Header - only show when no chat history */}
      {!hasStartedChat && (
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Explore the World Offline
          </h1>
          <p className="text-gray-600 text-lg">Find what you're looking for</p>
        </div>
      )}

      {/* Chat History */}
      {hasStartedChat && (
        <div className="flex-1 w-full space-y-6 mb-6 pt-28">
          {chatHistory.map((item, index) => (
            <div key={index}>
              {item.type === 'query' ? (
                <div className="flex justify-end mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl px-6 py-3 max-w-3xl">
                    <p className="text-base">{item.content}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-full">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600">Searching...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Bar - Fixed at bottom when chat started */}
      <div className={`w-full flex items-center justify-center transition-all duration-500 ${hasStartedChat ? 'sticky bottom-0 p-2  md:pt-4  md:pb-6' : ''}`}>
        <div className={`w-full relative transition-all duration-300 ${hasStartedChat ? 'max-w-4xl mx-auto' : 'max-w-2xl'} ${isFocused && !hasStartedChat ? 'transform scale-105' : ''}`}>
          <div className={`flex items-center bg-white rounded-full shadow-lg border-2 transition-all duration-300 ${isFocused ? 'border-blue-400 shadow-blue-200/50 shadow-2xl' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="pl-6 pr-3">
              <svg className={`w-6 h-6 transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={hasStartedChat ? "Ask a follow-up..." : "What are you searching for?"}
              className="flex-1 py-4 px-2 text-lg text-neutral-800 placeholder-gray-400 border-none outline-none bg-transparent"
              disabled={isLoading}
            />

            {!searchTerm.trim() ? (
              <button
                className="m-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full transition-all duration-700 hover:from-blue-600 hover:to-purple-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="m-2 px-3 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold transition-all duration-700 hover:from-blue-600 hover:to-purple-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <span className='px-5'>
                    Search
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};