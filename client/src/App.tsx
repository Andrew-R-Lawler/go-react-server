import React, { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Plus } from 'lucide-react';
import { StyledTable } from './components/styled-table';

function App() {
    
    interface Item {
        id: number
        name: string
        completed: boolean
    }

    const [items, setItems] = useState<Item[]>([
         { id: 1, name: "Placeholder", completed: false },
        { id: 2, name: "To-Do", completed: true },
        { id: 3, name: "Here", completed: false },
    ]);
    const [inputValue, setInputValue] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputValue.trim()) {
            const newItem: Item = {
                id: Date.now(),
                name: inputValue.trim(),
                completed: false,
            }
            setItems([...items, newItem])
            setInputValue("") // Clear the input after adding
        }
    }
    
  return (
    <div className="flex-container">
        <div className="space-y-4 w-full max-w-sm">
            <div className='flex-item'>
            <h1 className='chakra-petch-medium header1 text-white'>To-Do List</h1>
                <form onSubmit={handleAddItem} className="space-y-4 bg-stone-700 rounded-md">
                    <div className="flex items-center space-x-0 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-400">
                        <Input
                          type="text"
                          placeholder="Add an item..."
                          className="chakra-petch-regular border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                          value={inputValue}
                          onChange={handleChange}
                        />
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none rounded-none m-2 p-2 w-10 h-10 flex-shrink-0"
                          aria-label="Add item"
                        >
                          <Plus className="w-6 h-6" />
                        </Button>
                    </div>
                </form>
            </div>
            <StyledTable items={items} setItems={setItems} />
        </div>
    </div>
  )
}

export default App
