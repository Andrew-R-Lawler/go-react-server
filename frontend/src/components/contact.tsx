import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, MapPin, Phone } from "lucide-react"

export default function Contact() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        setIsLoading(true)

        const formData = new FormData(form)
        const data = {
            first_name: formData.get('first-name'),
            last_name: formData.get('last-name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        }

        try {
            await axios.post('/api/contact', data)
            form.reset()
            alert("Message Sent! We've received your message and will get back to you soon.")
        } catch (error) {
            console.error(error)
            alert("Error: Failed to send message. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="mb-6">
                    <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Get in Touch</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Do you have questions about our ingredients or want to partner with us? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                    {/* Contact Info Card */}
                    <div className="space-y-8">
                        <Card className="border-border h-full">
                            <CardHeader>
                                <CardTitle className="text-2xl">Contact Information</CardTitle>
                                <CardDescription>Reach out to us through any of these channels.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <MapPin className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-medium">Headquarters</h3>
                                        <p className="text-muted-foreground">
                                            123 Sustainable Way<br />
                                            Portland, OR 97204<br />
                                            United States
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Phone className="h-6 w-6 text-primary" />
                                    <div>
                                        <h3 className="font-medium">Phone</h3>
                                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Mail className="h-6 w-6 text-primary" />
                                    <div>
                                        <h3 className="font-medium">Email</h3>
                                        <p className="text-muted-foreground">hello@ecotheory.com</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map Placeholder or Extra Info */}
                        <Card className="border-border overflow-hidden">
                            <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">
                                Map Placeholder
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-2xl">Send us a Message</CardTitle>
                            <CardDescription>
                                Fill out the form below and we'll get back to you as soon as possible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first-name">First Name</Label>
                                        <Input name="first-name" id="first-name" placeholder="John" required disabled={isLoading} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name">Last Name</Label>
                                        <Input name="last-name" id="last-name" placeholder="Doe" required disabled={isLoading} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input name="email" id="email" type="email" placeholder="john@example.com" required disabled={isLoading} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input name="subject" id="subject" placeholder="How can we help?" required disabled={isLoading} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tell us more about your inquiry..."
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <Button className="w-full text-lg h-12" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
