import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, MapPin, Phone } from "lucide-react"

export default function Contact() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Get in Touch</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Do you have questions? We'd love to hear from you.
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
                                            123 Lorem Ipsum Avenue<br />
                                            Sit Amet City, 90210<br />
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
                                        <p className="text-muted-foreground">support@loremipsum.com</p>
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
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first-name">First Name</Label>
                                        <Input id="first-name" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name">Last Name</Label>
                                        <Input id="last-name" placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="john@example.com" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" placeholder="How can we help?" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <textarea
                                        id="message"
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <Button className="w-full text-lg h-12">
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
