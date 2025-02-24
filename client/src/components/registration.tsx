import type React from 'react'
import { useState } from 'react'
import '../App.css'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from "./ui/alert"
import { Input } from './ui/input'
import { Label } from './ui/label'
import { AlertCircle } from "lucide-react"
import axios from 'axios'

function UserRegistration() {

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')
        console.log('handleRegister called, email:', email, 'password:', password)
        const newUser = {
            email: email,
            password: password
        }
        try {
            const response = await axios.post("/api/user/register", newUser)
            return response.data
        } catch (error) {
            console.error(error)
        }
        setIsLoading(true)
        setError('')
    }

    return (
        <div className='flex-container'>
            <main className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-sm bg-stone-600 border-none">
                    <CardHeader className="chakra-petch-regular space-y-1 text-white">
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription className='text-white'>Enter your email and password to create your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                        <form onSubmit={handleRegister} className="space-y-4 text-white chakra-petch-regular">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input className='border-none' id="email" name="email" placeholder="name@example.com" required type="email" autoComplete="email" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input className='border-none' id="password" name="password" required type="password" autoComplete="password" />
                        </div>
                        <Button className="w-full" type="submit">
                            {isLoading ? "Signing up..." : "Sign up"}
                        </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default UserRegistration
