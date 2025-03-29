import React, { useState } from 'react'
import '../App.css'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus } from 'lucide-react';
import axios from 'axios'
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"

function ForgotPassword() {
    const [inputValue, setInputValue] = useState<string>('');

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            axios.post('/api/user/forgotpassword')
        } catch (err) {
            console.error(err)
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    return (
        <div className='flex-container chakra-petch-regular'>
        <Card className="w-[350px] bg-stone-600 border-none text-white">
            <CardHeader>
                <CardTitle>Reset your password</CardTitle>
                <CardDescription>Enter your email address and we'll send you a link to reset your password.</CardDescription>
            </CardHeader>
            <CardContent>
            <form>
            <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="email" placeholder="name@example.com" className='border-none'/>
            </div>
            </div>
            </form>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button className='w-full'>Send Reset Link</Button>
            </CardFooter>
        </Card>
        </div>
    )
}

export default ForgotPassword
