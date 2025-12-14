import React from 'react'

const App = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-purple-600">
      <h1 className="text-4xl font-bold text-white mb-4">
        Tailwind CSS is Working!
      </h1>
      <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-100 transition">
        Click Me
      </button>
    </div>
  )
}

export default App
