import '../App.css'
import React, { useState } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from 'axios'

function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const postData = {
            email: email
        }
        try {
            setError('')
            setIsLoading(true)
            const response = await axios.post('/api/user/forgotpassword', postData)
            console.log(response.data)
            if (response.data.message === 'Email sent to user!') {
                window.location.href = '/email-sent'
            }
        } catch (err) {
            console.error(err)
                if (axios.isAxiosError(err)) {
                    const response = err.response;
                    if (response) {
                        setError(response.data.error || 'An unknown error occured');
                    } else {
                        setError('Network error, please try again later')
                    }
                } else {
                    setError("Failed create password reset request, an uknown error has occured.")
                }
                setIsLoading(false)
        }
        setIsLoading(false)
    }

    return (
        <div className='flex-container chakra-petch-regular'>
        <Card className="w-[350px] bg-stone-600 border-none text-white">
        <form onSubmit={handleForgotPassword}>
            <CardHeader>
                <CardTitle>Reset your password</CardTitle>
                <CardDescription>Enter your email address and we'll send you a link to reset your password.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5 pt-2">
              <Label htmlFor="name">E-Mail Address</Label>
              <Input id="email" name='email' type='email' disabled={isLoading} placeholder="name@example.com" className='border-none'/>
              { error && 
                  <Alert variant="destructive" className='border-red-600 text-red-600 p-2 my-2 bg-red-300'>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription><p className='text-red-600'>{error}</p></AlertDescription>
              </Alert>
              }
            </div>
            </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
                <Button className='w-full' type='submit' disabled={isLoading}>
                    {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </Button>
            </CardFooter>
            </form>
        </Card>
        </div>
    )
}

export default ForgotPassword
