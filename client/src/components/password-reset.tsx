import '../App.css'
// import { useParams } from 'react-router-dom'
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
//    const { token } = useParams();

    return (
        <div className='flex-container chakra-petch-regular'>
        <Card className="w-[350px] bg-stone-600 border-none text-white">
        <form>
            <CardHeader>
                <CardTitle>Reset password</CardTitle>
                <CardDescription>Please enter your new password.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5 pt-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" name='New Password' type='password' className='border-none'/>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" name='Confirm Password' type='password' className='border-none'/>
            </div>
            </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
                <Button className='w-full' type='submit'>
                    Reset Password
                </Button>
            </CardFooter>
            </form>
        </Card>
        </div>
    )
}

export default PasswordReset
