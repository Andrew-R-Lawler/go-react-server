import type React from 'react'
import { useState } from 'react'
import { AlertCircle } from "lucide-react"
import '../App.css'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'

function Login() {

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')
        const user = {
            email: email,
            password: password,
        }
        console.log('handleLogin called, email:', email, 'password:', password)
        try {
            const response = await axios.post("/api/user/login", user)
            return response.data
        } catch (error) {
            console.error(error)
        }
        setIsLoading(true)
        setError('')
    }

    return (
        <div className="flex-container">
            <Card className="w-full max-w-sm mx-auto bg-stone-600 chakra-petch-regular border-none">
                <CardHeader className='chakra-petch-regular space-y-1 text-white'>
                    <CardTitle className='text-2xl font-bold'>Login</CardTitle>
                    <CardDescription className='chakra-petch-regular text-white'>Enter your email and password to login to your account.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                <div className="space-y-2 text-white chakra-petch-regular">
                <Label htmlFor="email"><h2>Email</h2></Label>
                <Input className='border-none' id="email" type="email" name="email" placeholder="name@example.com" required autoComplete="email" />
                </div>
                <div className="space-y-2 text-white chakra-petch-regular">
                <Label htmlFor="password"><h2>Password</h2></Label>
                <Input className='border-none' id="password" type="password" name="password" required autoComplete="current-password" />
                </div>
                </CardContent>
                <CardFooter className='mt-2 pt-3 -mb-1'>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default Login
