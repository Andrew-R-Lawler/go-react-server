import '../App.css'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Separator } from './ui/separator'
function ResetSuccess() {

    return (
        <div className='flex-container chakra-petch-regular'>
        <Card className="w-xl bg-stone-600 border-none text-white">
        <form>
            <CardHeader>
                <CardTitle className='text-xl pb-2'>Your password has been changed!</CardTitle>
            </CardHeader>
            <CardContent>
                <Separator className='my-2'/>
                <p className='pt-2'>You can now log in with your new password.</p>
            </CardContent>
            </form>
        </Card>
        </div>
    )
}

export default ResetSuccess
