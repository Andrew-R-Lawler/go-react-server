import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
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
        <div className="flex w-full max-w-sm items-center space-x-0 border-none rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-400">
      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Add an item..."
        className="font-chakra border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button
        className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none rounded-none p-2 w-10 h-10 flex-shrink-0"
        aria-label="Add item"
        onClick={handlePost}
      >
        <Plus className="w-6 h-6" />
      </Button>
      </div>
    </div>
    </div>
  )
}

export default App
