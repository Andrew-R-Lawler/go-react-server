import type React from 'react'
import { useState } from 'react'
import { AlertCircle } from "lucide-react"
import '../App.css'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from './authentication'
import { Link } from 'react-router-dom'

function Login() {

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email') as string | null
        if (!email) {
            setError('Email is required')
            setIsLoading(false)
            return
        }
        const formattedEmail = email.toLowerCase();
        const password = formData.get('password')
        try {
            setError('')
            const message = await login(formattedEmail, password)
            if (message === 'Success') {
                window.location.href = '/'
            } else {
                setError('Email or Password is incorrect')
                setIsLoading(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <Card className="w-full max-w-sm mx-auto bg-card border-border text-card-foreground">
                <CardHeader className='space-y-1 text-card-foreground border-b border-border pb-4 mb-4'>
                    <CardTitle className='text-2xl font-bold'>Login</CardTitle>
                    <CardDescription className='text-muted-foreground'>Enter your email and password to login to your account.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        {error &&
                            <Alert variant="destructive" className='border-red-900 bg-red-900/20 text-red-200 pb-2'>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription><p className='text-red-200'>{error}</p></AlertDescription>
                            </Alert>
                        }
                        <div className="space-y-2 text-card-foreground">
                            <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                            <Input className='bg-background border-input text-foreground placeholder:text-muted-foreground' id="email" type="email" name="email" placeholder="name@example.com" required autoComplete="email" />
                        </div>
                        <div className="space-y-2 text-card-foreground">
                            <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                            <Input className='bg-background border-input text-foreground' id="password" type="password" name="password" required autoComplete="current-password" />
                        </div>
                    </CardContent>
                    <CardFooter className='mt-2 pt-3 flex flex-col gap-4'>
                        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
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

                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground mt-4">
                            <div>
                                Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign Up</Link>
                            </div>
                            <div>
                                Forgot your password? <Link to="/forgot-password" className='text-primary hover:underline'>Click Here</Link>
                            </div>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default Login
