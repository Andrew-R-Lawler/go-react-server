import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>1. Introduction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Welcome to Eco Theory Soap Co. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>2. Data We Collect</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Identity Data</strong> includes first name, last name, and username.</li>
                            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers. (Note: These are securely encrypted in our database).</li>
                            <li><strong>Financial Data</strong> is processed securely by our payment provider (Stripe). We do not store your credit card details on our servers.</li>
                            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, via our self-hosted Matomo Analytics.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>3. How We Use Your Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g. shipping your order).</li>
                            <li>Where it is necessary for our legitimate interests (e.g. analyzing site traffic using Matomo) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal obligation (e.g. tax reporting).</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>4. Third-Party Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>We use the following third-party services which may act as Data Processors or Controllers:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Stripe:</strong> Used for secure payment processing. When you make a purchase, your payment data is sent directly to Stripe. You can review Stripe's Privacy Policy on their website.</li>
                            <li><strong>Matomo:</strong> We use self-hosted Matomo for analytics to understand website traffic. We require your explicit consent before tracking you with Matomo.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>5. Your Legal Rights (GDPR)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Request access</strong> to your personal data (commonly known as a "data subject access request"). You can easily download your data from the Account Settings page.</li>
                            <li><strong>Request erasure</strong> of your personal data. You can delete your account permanently from the Account Settings page, which also automatically purges your data from our Matomo analytics.</li>
                            <li><strong>Withdraw consent</strong> at any time where we are relying on consent to process your personal data. You can update your cookie preferences using the link in the footer.</li>
                        </ul>
                    </CardContent>
                </Card>
                
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>6. Contact Us</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>If you have any questions about this privacy policy or our privacy practices, please contact us via our Contact page.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
