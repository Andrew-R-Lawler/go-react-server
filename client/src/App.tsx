import React, { useState } from 'react'
import './App.css'


function App() {
    const [inputValue, setInputValue] = useState<string>('');
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };
    const handlePost = () => {
        console.log('button pressed', inputValue);
        setInputValue('');
    }
    
  return (
    <div className="flex-container">
        <div className="flex-item">
        <h1 className="header1">To-Do List</h1>
        <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Add an item..."
      />
      <button
        aria-label="Add item"
        onClick={handlePost}
      >
      +
      </button>
      </div>
    </div>
    </div>
  )
}

export default App
