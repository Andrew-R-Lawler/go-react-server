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
                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
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
