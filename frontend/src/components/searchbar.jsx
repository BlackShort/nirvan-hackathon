import React, { useState } from 'react'

export const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [hasResults, setHasResults] = useState(false)

    // Mock search results for demonstration
    const mockResults = {
        answer: "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. It encompasses various technologies including machine learning, natural language processing, computer vision, and robotics.",
        sources: [
            { id: 1, title: "What is Artificial Intelligence?", url: "stanford.edu", snippet: "AI is a broad field of computer science focused on creating smart machines..." },
            { id: 2, title: "AI Definition and Applications", url: "mit.edu", snippet: "Artificial intelligence involves programming computers to make decisions..." },
            { id: 3, title: "Understanding AI Technology", url: "ieee.org", snippet: "The goal of AI is to create systems that can function intelligently..." }
        ],
        relatedQuestions: [
            "How does machine learning work?",
            "What are the types of AI?",
            "What is the difference between AI and ML?"
        ]
    }

    const handleSearch = () => {
        if (!searchTerm.trim()) return
        
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            setHasResults(true)
        }, 1500)
    }

    return (
        <div className="w-full flex flex-col items-center space-y-8 px-4 max-w-6xl mx-auto">
            {/* Title with gradient */}
            <div className="text-center">
                <h1 className='text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                    Explore the World Offline
                </h1>
                <p className="text-gray-600 text-lg">Find what you're looking for</p>
            </div>

            {/* Search container with shadow and glow effect */}
            <div className={`relative max-w-2xl w-full transition-all duration-300 ${isFocused ? 'transform scale-105' : ''
                }`}>
                <div className={`flex items-center bg-white rounded-full shadow-lg border-2 transition-all duration-300 ${isFocused
                        ? 'border-blue-400 shadow-blue-200/50 shadow-2xl'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    {/* Search icon */}
                    <div className="pl-6 pr-3">
                        <svg
                            className={`w-6 h-6 transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-gray-400'
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Input field */}
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

                    {/* Search button */}
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

            {/* Quick suggestions - only show if no results */}
            {!hasResults && (
                <div className="flex flex-wrap gap-2 max-w-2xl justify-center">
                    {['Popular', 'Trending', 'Recent', 'Categories'].map((tag) => (
                        <span
                            key={tag}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 hover:scale-105"
                            onClick={() => {
                                setSearchTerm(tag)
                                handleSearch()
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Perplexity-style Results Section */}
            {hasResults && (
                <div className="w-full max-w-4xl space-y-6 mt-8">
                    {/* Answer Section */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-start space-x-4">
                            {/* AI Avatar */}
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            
                            {/* Answer Content */}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Answer</h3>
                                <p className="text-gray-700 leading-relaxed">{mockResults.answer}</p>
                                
                                {/* Source References */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {mockResults.sources.map((source) => (
                                        <span key={source.id} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200">
                                            <span className="w-1 h-1 bg-blue-500 rounded-full mr-1"></span>
                                            {source.id}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sources Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Sources</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {mockResults.sources.map((source) => (
                                <div key={source.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group">
                                    <div className="flex items-start space-x-3">
                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex-shrink-0">
                                            {source.id}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {source.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">{source.url}</p>
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{source.snippet}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Related Questions */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Related Questions</h3>
                        <div className="space-y-2">
                            {mockResults.relatedQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                                    onClick={() => {
                                        setSearchTerm(question)
                                        handleSearch()
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 group-hover:text-gray-900">{question}</span>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear Results Button */}
                    <div className="flex justify-center pt-6">
                        <button
                            onClick={() => {
                                setHasResults(false)
                                setSearchTerm('')
                            }}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
                        >
                            New Search
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}