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
        const email = formData.get('email')
        const password = formData.get('password')
        const newUser = {
            email: email,
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
        <div className='flex-container'>
            <main className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-sm bg-stone-600 border-none">
                    <CardHeader className="chakra-petch-regular space-y-1 text-white">
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription className='text-white'>
                            Enter your email and password to create your account, your password must have:
                        </CardDescription>
                            <ul className='list-disc pl-5 text-sm'>
                            <li className='pl-1'>At least 8 characters</li> 
                            <li className='pl-1'>One uppercase letter</li>
                            <li className='pl-1'>One number</li>
                            <li className='pl-1'>One special character</li>
                            </ul>
                    </CardHeader>
                      { error && 
                          <Alert variant="destructive" className='border-red-600 text-red-600 p-2 my-2 bg-red-300'>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription><p className='text-red-600'>{error}</p></AlertDescription>
                      </Alert>
                      }
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4 text-white chakra-petch-regular">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input className='border-none' id="email" name="email" placeholder="name@example.com" required type="email" autoComplete="email" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input className='border-none' id="password" name="password" required type="password" autoComplete="password" pattern={passwordPattern} />
                        </div>
                        <Button className="w-full" type="submit">
                            {isLoading ? "Signing up..." : "Sign up"}
                        </Button>
                        </form>
                    </CardContent>
                        <div className="flex-item nav-item">
                            <p>Already Signed up?</p><Link to="/login">Sign In</Link>
                        </div>
                </Card>
            </main>
        </div>
    )
}

export default UserRegistration
