import React from 'react'

const Courses = () => {
    const handleStartLearning = () => {
        window.open('http://192.168.137.1:8080', '_blank');
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                        <div className="flex items-center justify-center mb-4">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-center mb-2">Start Your Learning Journey</h1>
                        <p className="text-center text-blue-100 text-lg">Unlock thousands of courses and expand your skills</p>
                    </div>

                    {/* Content Section */}
                    <div className="p-8">
                        {/* CTA Button */}
                        <button
                            onClick={handleStartLearning}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                        >
                            <span className="text-lg">Start Learning</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>

                        {/* Additional Info */}
                        <p className="text-center text-gray-500 text-sm mt-4">
                            Join millions of learners worldwide
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Courses