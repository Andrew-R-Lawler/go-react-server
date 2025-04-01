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

function PasswordReset() {
    const { token } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [isValid, setIsValid] = useState(false)

    const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const newPassword = formData.get('New Password')
        const confirmPassword = formData.get('Confirm Password')
        const postData = {
            newPassword: newPassword,
            confirmPassword: confirmPassword,
            token: token,
        }
        setIsLoading(true)
        try {
            setIsLoading(false)
        } catch (err) {
            console.error(err)
        }
        console.log(postData)
    }

    const handleInputValidation = (event: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget)
        const newPassword = formData.get('New Password')
        const confirmPassword = formData.get('Confirm Password')
        if (newPassword === confirmPassword) {
            setIsValid(true)
        }
        if (newPassword !== confirmPassword) {
            setIsValid(false)
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
              <Input id="confirm-password" name='Confirm Password' type='password' className={isValid ? 'border-green-600' : 'border-red-600'}/>
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
