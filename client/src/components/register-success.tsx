import '../App.css'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Separator } from './ui/separator'
function RegisterSuccess() {

    return (
        <div className='flex-container chakra-petch-regular'>
        <Card className="w-xl bg-stone-600 border-none text-white">
        <form>
            <CardHeader>
                <CardTitle className='text-xl'>Thank you for signing up!</CardTitle>
                    <Separator className='mt-2 text-grey-800'/>
                <CardDescription className='text-white py-2'>You will receive a verification email shortly. Check your spam folder if it doesn't show up within one or two minutes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Separator className='my-2'/>
                <p className='pt-2 text-sm'>If it the email hasn't appeared in your inbox try registering again or reach out to our support.</p>
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
            </CardFooter>
            </form>
        </Card>
        </div>
    )
}

export default RegisterSuccess
