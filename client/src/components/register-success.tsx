import '../App.css'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card"
import { Button } from "./ui/button"
import { Link } from 'react-router-dom'

function RegisterSuccess() {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <Card className="w-full max-w-sm mx-auto bg-card border-border text-card-foreground">
                <CardHeader>
                    <CardTitle className='text-2xl'>Thank you for signing up!</CardTitle>
                    <CardDescription>
                        Registration successful.
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-4'>
                    <p className='text-sm text-muted-foreground'>
                        You will receive a verification email shortly. Please verify your account to continue.
                        <br /><br />
                        Check your spam folder if it doesn't show up within a few minutes.
                    </p>
                    <Link to="/login" className="w-full">
                        <Button className="w-full">Proceed to Login</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}

export default RegisterSuccess
