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
    const [newPasswordStyles, setNewPasswordStyles] = useState('')
    const [confirmPasswordStyles, setConfirmPasswordStyles] = useState('')
    const [error, setError] = useState('')

    const passwordPattern = "^(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$";

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
                setNewPasswordStyles('')
                setConfirmPasswordStyles('')
            }
        }
        else {
            setError('Password inputs must be matching!')
        }
    }

    const handleInputValidation = (event: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget)
        const newPassword = formData.get('New Password') as string
        const confirmPassword = formData.get('Confirm Password') as string

        console.log("Validating:", newPassword, confirmPassword);
        const regex = new RegExp(passwordPattern);

        // Validate New Password
        if (!newPassword) {
            setNewPasswordStyles('')
        } else if (regex.test(newPassword)) {
            setNewPasswordStyles("border-2 border-solid border-green-600")
        } else {
            setNewPasswordStyles("border-2 border-solid border-red-600")
        }

        // Validate Confirm Password
        if (!confirmPassword) {
            setConfirmPasswordStyles('')
        } else if (newPassword === confirmPassword && newPassword) {
            setConfirmPasswordStyles("border-2 border-solid border-green-600")
        } else {
            setConfirmPasswordStyles("border-2 border-solid border-red-600")
        }

        // Clear error if basic validation passes (detailed error logic remains in submit)
        if (newPassword === confirmPassword && regex.test(newPassword)) {
            setError('')
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-background'>
            <Card className="w-[350px] bg-card border-border text-card-foreground">
                <form onSubmit={handlePasswordReset} onChange={handleInputValidation}>
                    <CardHeader>
                        <CardTitle>Reset password</CardTitle>
                        <CardDescription className='text-muted-foreground'>Please enter your new password. Password must have:</CardDescription>
                        <ul className='list-disc pl-5 text-sm text-muted-foreground pt-2'>
                            <li className='pl-1'>At least 8 characters</li>
                            <li className='pl-1'>One uppercase letter</li>
                            <li className='pl-1'>One number</li>
                            <li className='pl-1'>One special character</li>
                        </ul>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5 pt-2">
                                <Label htmlFor="new-password" className='pt-2 text-muted-foreground'>New Password</Label>
                                <Input id="new-password" name='New Password' type='password' className={`bg-background border-input text-foreground placeholder:text-muted-foreground ${newPasswordStyles}`} pattern={passwordPattern} disabled={isLoading} />
                                <Label htmlFor="confirm-password" className='pt-2 text-muted-foreground'>Confirm Password</Label>
                                <Input id="confirm-password" name='Confirm Password' type='password' className={`bg-background border-input text-foreground placeholder:text-muted-foreground ${confirmPasswordStyles}`} pattern={passwordPattern} disabled={isLoading} />
                                {error &&
                                    <Alert variant="destructive" className='border-red-900 bg-red-900/20 text-red-200 mt-2 p-3'>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription><p className='text-red-200'>{error}</p></AlertDescription>
                                    </Alert>
                                }
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-2">
                        <Button className='w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors' type='submit' disabled={isLoading}>
                            {isLoading ? "Resetting Password..." : "Reset Password"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default PasswordReset
