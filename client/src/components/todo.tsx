import React, { useEffect, useState } from 'react'
import '../App.css'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus } from 'lucide-react';
import { StyledTable } from './styled-table';
import axios from 'axios'

function Todo() {

    interface Item {
        id: number
        name: string
        completed: boolean
        editable: boolean
    }

    const [inputValue, setInputValue] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [items, setItems] = useState<Item[]>([
         { id: 1, name: "Placeholder", completed: false, editable: false },
        { id: 2, name: "To-Do", completed: true, editable: false },
        { id: 3, name: "Here", completed: false, editable: false },
    ]);

    const fetchTodos = async () => {
        const response = await axios.get('/api/todo/');
        if (response.data === null) {
            setItems([{id: 1, name: "start adding to-dos", completed: false, editable: false }]);  
        } else (
            setItems(response.data)
        )
        return response.data;
    }


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (inputValue.trim() === '') {
            setError('Input Cannot be empty');
        } else {
            try {
                const response = await axios.post('/api/todo', inputValue)
                setInputValue("") 
                setError("")
                fetchTodos()
                return response
            } catch (error) {
                console.error('Error adding todo:', error)
            }
        }
    }

    useEffect(() => {
        fetchTodos();
    }, [])
    
  return (
    <div className="flex-container">
        <div className="space-y-4 w-full max-w-sm">
            <div className='flex-item'>
            <h1 className='chakra-petch-medium header1 text-white'>To-Do List</h1>
                <form onSubmit={handleAddItem} className="space-y-4 bg-stone-700 rounded-md">
                    <div className="flex items-center space-x-0 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-offset-1">
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
                {error && <p className= "chakra-petch-regular text-red-500 text-left">{error}</p>}
            </div>
            <StyledTable items={items} setItems={setItems} fetchTodos={fetchTodos} />
        </div>
    </div>
  )
}

export default Todo
