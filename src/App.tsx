// import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          Portfolio Blog
        </h1>
        <p className="text-muted-foreground">
          Tailwind CSS is working!  🎉
        </p>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
          Click me
        </button>
      </div>
    </div>
  );
}

export default App;
