import '../App.css'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "./ui/card"
import { Button } from "./ui/button"
import { Link } from 'react-router-dom'

function ResetSuccess() {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <Card className="w-full max-w-sm mx-auto bg-card border-border text-card-foreground">
                <CardHeader>
                    <CardTitle className='text-2xl'>Password Changed</CardTitle>
                    <CardDescription>
                        Your password has been successfully updated.
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4'>
                    <p className='text-sm text-muted-foreground'>
                        You can now log in with your new credentials.
                    </p>
                    <Link to="/login" className="w-full">
                        <Button className="w-full">Return to Login</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}

export default ResetSuccess
