import React, { useState } from 'react';
import axios from 'axios';

export const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/search', { q: searchTerm });
      const data = response.data;

      setAnswer(data.answer || 'No answer found');
      setSources(data.sources || []); // optional if backend returns sources
      setRelatedQuestions(data.relatedQuestions || []); // optional if backend returns related questions
      setHasResults(true);
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-8 px-4 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Explore the World Offline
        </h1>
        <p className="text-gray-600 text-lg">Find what you're looking for</p>
      </div>

      {/* Search Bar */}
      <div className={`relative max-w-2xl w-full transition-all duration-300 ${isFocused ? 'transform scale-105' : ''}`}>
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
            placeholder="What are you searching for?"
            className="flex-1 py-4 px-2 text-lg text-neutral-800 placeholder-gray-400 border-none outline-none bg-transparent"
          />

          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="m-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Quick suggestions */}
      {!hasResults && (
        <div className="flex flex-wrap gap-2 max-w-2xl justify-center">
          {['Popular', 'Trending', 'Recent', 'Categories'].map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 hover:scale-105"
              onClick={() => {
                setSearchTerm(tag);
                handleSearch();
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="w-full max-w-4xl space-y-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Answer</h3>
                <p className="text-gray-700 leading-relaxed">{answer}</p>
              </div>
            </div>
          </div>

          {/* Clear Results Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={() => {
                setHasResults(false);
                setSearchTerm('');
                setAnswer('');
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
            >
              New Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
