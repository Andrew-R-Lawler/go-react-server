import type React from 'react'
import { useState } from 'react'
import '../App.css'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

function UserRegistration() {

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const passwordPattern = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email') as string | null
        if (!email) {
            setError('Email is required')
            setIsLoading(false)
            return
        }
        const formattedEmail = email.toLowerCase();
        const password = formData.get('password')
        const newUser = {
            email: formattedEmail,
            password: password
        }
        setIsLoading(true)
        try {
            const response = await axios.post("/api/user/register", newUser)
            window.location.href = '/registration-success'
            return response.data
        } catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                const response = error.response;
                if (response) {
                    setError(response.data.error || 'An unknown error occured');
                } else {
                    setError('Network error, please try again later')
                }
            } else {
                setError("Failed to register user, an unknown error has occured.")
            }
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <main className="flex w-full justify-center p-4">
                <Card className="w-full max-w-sm bg-card border border-border text-card-foreground">
                    <CardHeader className="space-y-1 text-card-foreground border-b border-border pb-4 mb-4">
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription className='text-muted-foreground'>
                            Enter your email and password to create your account, your password must have:
                        </CardDescription>
                        <ul className='list-disc pl-5 text-sm text-muted-foreground pt-2'>
                            <li className='pl-1'>At least 8 characters</li>
                            <li className='pl-1'>One uppercase letter</li>
                            <li className='pl-1'>One number</li>
                            <li className='pl-1'>One special character</li>
                        </ul>
                    </CardHeader>
                    {error &&
                        <Alert variant="destructive" className='border-red-900 bg-red-900/20 text-red-200 mx-6'>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription><p className='text-red-200'>{error}</p></AlertDescription>
                        </Alert>
                    }
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4 text-card-foreground">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                                <Input className='bg-background border-input text-foreground placeholder:text-muted-foreground' id="email" name="email" placeholder="name@example.com" required type="email" autoComplete="email" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                                <Input className='bg-background border-input text-foreground' id="password" name="password" required type="password" autoComplete="password" pattern={passwordPattern} />
                            </div>
                            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" type="submit">
                                {isLoading ? "Signing up..." : "Sign up"}
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Already Signed up? <Link to="/login" className="text-primary hover:underline transition-all pl-1">Sign In</Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default UserRegistration
