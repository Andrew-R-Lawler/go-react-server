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
                            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" type="submit" disabled={isLoading}>
                                {isLoading ? "Signing up..." : "Sign up"}
                            </Button>

                            <div className="relative w-full py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                <a href="/api/user/auth/google" className="w-full">
                                    <Button type="button" variant="outline" className="w-full hover:bg-muted/50 border-border text-card-foreground">
                                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.2z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google
                                    </Button>
                                </a>
                                <a href="/api/user/auth/facebook" className="w-full">
                                    <Button type="button" variant="outline" className="w-full hover:bg-muted/50 border-border text-card-foreground">
                                        <svg className="mr-2 h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-1.125 0-2.703.356-2.703 1.576v1.944h4.636a7.025 7.025 0 0 1-.925 3.667h-3.711v7.98c5.441-1.042 9.5-5.83 9.5-11.691C24 5.302 18.627 0 12 0 5.373 0 0 5.302 0 12c0 5.86 4.059 10.649 9.101 11.691z" />
                                        </svg>
                                        Facebook
                                    </Button>
                                </a>

                            </div>
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
