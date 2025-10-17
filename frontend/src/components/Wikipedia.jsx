import React from 'react'

const Wikipedia = () => {
  return (
    <div className="p-6 flex items-center justify-center h-full w-full bg-neutral-100 rounded-lg">
        <div className="flex items-center max-w-md w-full">
            <iframe src="http://192.168.137.1:1024" frameborder="0" width={400} height={600}></iframe>
        </div>
    </div>
  )
}

export default Wikipedia
