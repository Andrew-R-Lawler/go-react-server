import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Link } from "react-router-dom"

function Careers() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Hero Header */}
            <div className="bg-muted py-12 mb-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Join Our Team</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We are always looking for talented individuals to join our growing family.
                        Help us build the future of e-commerce.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 pb-16 space-y-12">

                {/* Introduction */}
                <section className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Why Work With Us?</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We are always looking for passionate individuals who share our vision for sustainable skincare.
                        Join us in our mission to change the world, one bar of soap at a time.
                    </p>
                </section>

                {/* Open Positions */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
                    <div className="space-y-4">
                        {/* Placeholder Job 1 */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Frontend Developer</CardTitle>
                                        <CardDescription>Engineering • Remote</CardDescription>
                                    </div>
                                    <Button variant="outline">Apply Now</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    We are looking for a passionate React developer to help build
                                    beautiful and responsive user interfaces. Experience with Tailwind CSS and
                                    TypeScript is a plus.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Placeholder Job 2 */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Product Designer</CardTitle>
                                        <CardDescription>Design • New York, NY</CardDescription>
                                    </div>
                                    <Button variant="outline">Apply Now</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Join our design team to create intuitive and engaging experiences for our customers.
                                    You will work closely with product managers and engineers.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Placeholder Job 3 */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Customer Support Specialist</CardTitle>
                                        <CardDescription>Support • Remote</CardDescription>
                                    </div>
                                    <Button variant="outline">Apply Now</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Be the face of our company and help our customers have the best shopping experience possible.
                                    Excellent communication skills required.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-8 border-t border-border">
                    <h3 className="text-xl font-semibold mb-2">Don't see a perfect fit?</h3>
                    <p className="text-muted-foreground mb-6">
                        We are always interested in meeting great people. Send us your resume and we'll keep you in mind for future openings.
                    </p>
                    <a href="mailto:hello@ecotheory.com">
                        <Button>Contact Us</Button>
                    </a>
                </section>

                <div className="text-center">
                    <Link to="/">
                        <Button variant="ghost">← Back to Home</Button>
                    </Link>
                </div>
            </main>
        </div>
    )
}

export default Careers
