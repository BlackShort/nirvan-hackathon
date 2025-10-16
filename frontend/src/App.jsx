import { useState } from 'react'
import { SearchBar } from './components/searchbar'
import { FileBrowser } from './components/FileBrowser'
import { ChatSystem } from './components/ChatSystem'
import { OfflineMaps } from './components/OfflineMaps'

const App = () => {
  const [activeTab, setActiveTab] = useState('search')

  return (
    <div className='bg-neutral-900 text-white h-screen flex flex-col items-start justify-center overflow-y-auto'>
      {/* Navigation Tabs */}
      <div className="flex items-center justify-center w-full fixed top-5 z-10">
        <div className="max-w-6xl rounded-full mx-auto px-6 bg-white border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'files'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Files</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Chat</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('maps')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'maps'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Maps</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex items-center justify-center w-full min-h-screen">
        {activeTab === 'search' ? (
          <div className="flex items-start justify-center py-8">
            <SearchBar />
          </div>
        ) : activeTab === 'files' ? (
          <div className="py-8">
            <FileBrowser />
          </div>
        ) : activeTab === 'chat' ? (
          <ChatSystem />
        ) : activeTab === 'maps' ? (
          <div className="py-8">
            <OfflineMaps />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default App