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

function EmailSent() {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <Card className="w-full max-w-sm mx-auto bg-card border-border text-card-foreground">
                <CardHeader>
                    <CardTitle className='text-2xl'>Email Sent</CardTitle>
                    <CardDescription>
                        We've sent a password reset link to your email address.
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4'>
                    <p className='text-sm text-muted-foreground'>
                        Please check your inbox (and spam folder) for further instructions.
                    </p>
                    <Link to="/login" className="w-full">
                        <Button className="w-full">Return to Login</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}

export default EmailSent
