import React, { useState } from 'react'
import '../App.css'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus } from 'lucide-react';

function ForgotPassword() {
    const [inputValue, setInputValue] = useState<string>('');

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    return (
    <div className="flex-container">
        <div className="space-y-4 w-full max-w-sm">
            <div className='flex-item'>
            <h1 className='chakra-petch-medium header1 text-white'>Forgotten Password</h1>
                <form onSubmit={handleForgotPassword} className="space-y-4 bg-stone-700 rounded-md">
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
                          className="bg-stone-900 text-white border-none rounded-none m-2 p-2 w-10 h-10 flex-shrink-0"
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

export default ForgotPassword
