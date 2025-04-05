import '../App.css'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from 'axios';

function PasswordReset() {

    const { token } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [styles, setStyles] = useState('border-none')
    const [error, setError] = useState('')

    const passwordPattern = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const newPassword = formData.get('New Password')
        const confirmPassword = formData.get('Confirm Password')
        if (newPassword === confirmPassword) {
            try {
                setIsLoading(true)
                // run axios PUT to update user's password with newPassword
                const response = await axios.post('/api/user/resetpassword', { token, newPassword })
                if (response.data.message === 'Password reset successful!') {
                    window.location.href = '/reset-success'
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    const response = err.response;
                    if (response) {
                        setError(response.data.error || 'An unknown error occured');
                    } else {
                        setError('Network error, please try again later')
                    }
                } else {
                    setError("Failed to reset password, an unknown error has occured.")
                }
                setIsLoading(false)
                setStyles('border-none')
            }
        }
        else {
            setError('Password inputs must be matching!')
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
                <CardDescription className='text-white'>Please enter your new password. Password must have:</CardDescription>
                    <ul className='list-disc pl-5 text-sm'>
                        <li className='pl-1'>At least 8 characters</li> 
                        <li className='pl-1'>One uppercase letter</li>
                        <li className='pl-1'>One number</li>
                        <li className='pl-1'>One special character</li>
                    </ul>
            </CardHeader>
            <CardContent>
            <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5 pt-2">
              <Label htmlFor="new-password" className='pt-2'>New Password</Label>
              <Input id="new-password" name='New Password' type='password' className='border-none' pattern={passwordPattern} disabled={isLoading}/>
              <Label htmlFor="confirm-password" className='pt-2'>Confirm Password</Label>
              <Input id="confirm-password" name='Confirm Password' type='password' className={styles} pattern={passwordPattern} disabled={isLoading}/>
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
                    {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>
            </CardFooter>
            </form>
        </Card>
        </div>
    )
}

export default PasswordReset
