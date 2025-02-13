import React, { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Plus } from 'lucide-react';

function App() {

    const [inputValue, setInputValue] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handlePost = (event: React.ChangeEvent<HTMLFormElement>) => {
        console.log('button pressed', inputValue);
        setInputValue('');
        event.preventDefault();
    }
    
  return (
    <div className="flex-container">
    <div className="space-y-4 w-full max-w-sm">
        <div className='flex-item'>
        <h1 className='chakra-petch-medium header1 text-white'>To-Do List</h1>
        <form onSubmit={handlePost} className="space-y-4">
            <div className="flex items-center space-x-0 border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-400">
                <Input
                  type="text"
                  placeholder="Add an item..."
                  className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                  value={inputValue}
                  onChange={handleChange}
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none rounded-none m-1 p-2 w-10 h-10 flex-shrink-0"
                  aria-label="Add item"
                >
                  <Plus className="w-6 h-6" />
                </Button>
            </div>
        </form>
        </div>
    </div>
    </div>
  )
}

export default App
