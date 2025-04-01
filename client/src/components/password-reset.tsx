import '../App.css'
import { useParams } from 'react-router-dom'
import React, { useState } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { AlertCircle } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

function PasswordReset() {
    const { token } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [styles, setStyles] = useState('border-none')
    const [error, setError] = useState('')

    const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const newPassword = formData.get('New Password')
        const confirmPassword = formData.get('Confirm Password')
        const postData = {
            newPassword: newPassword,
            token: token,
        }
        if (newPassword === confirmPassword) {
            try {
                setIsLoading(true)
                // run axios PUT to update user's password with newPassword
                console.log(postData)
            } catch (err) {
                console.error(err)
            }
        }
        else {
            setError('Password inputs must be matching!')
            console.log(error)
        }
    }

    const handleInputValidation = (event: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget)
        const newPassword = formData.get('New Password')
        const confirmPassword = formData.get('Confirm Password')
        if (newPassword === confirmPassword) {
            setStyles("border-green-600")
            setError('')
        }
        if (newPassword !== confirmPassword) {
            setStyles("border-red-600")
        }
    }

    return (
        <div className='flex-container chakra-petch-regular'>
        <Card className="w-[350px] bg-stone-600 border-none text-white">
        <form onSubmit={handlePasswordReset} onChange={handleInputValidation}>
            <CardHeader>
                <CardTitle>Reset password</CardTitle>
                <CardDescription>Please enter your new password.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5 pt-2">
              <Label htmlFor="new-password" className='pt-2'>New Password</Label>
              <Input id="new-password" name='New Password' type='password' className='border-none'/>
              <Label htmlFor="confirm-password" className='pt-2'>Confirm Password</Label>
              <Input id="confirm-password" name='Confirm Password' type='password' className={styles}/>
              { error && 
                  <Alert variant="destructive" className='border-red-600 text-red-600 p-2 bg-red-300'>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription><p className='text-red-600'>{error}</p></AlertDescription>
              </Alert>
              }
            </div>
            </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
                <Button className='w-full' type='submit'>
                    {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>
            </CardFooter>
            </form>
        </Card>
        </div>
    )
}

export default PasswordReset
