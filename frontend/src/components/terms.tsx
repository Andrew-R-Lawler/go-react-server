import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Terms() {
    return (
        <div className="min-h-screen bg-background py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>1. Introduction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Welcome to Eco Theory Soap Co. ("we," "our," or "us"). By accessing or using our website and purchasing our products, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>2. Products and Purchases</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>All products are subject to availability. We reserve the right to limit the quantities of any products that we offer. We make every effort to display as accurately as possible the colors and images of our products. However, we cannot guarantee that your computer monitor's display of any color will be accurate.</p>
                        <p>By placing an order, you warrant that you are legally capable of entering into binding contracts and that all information provided is accurate and complete.</p>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>3. Pricing and Payments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Prices for our products are subject to change without notice. We process all payments through secure third-party processors (e.g., Stripe). You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.</p>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>4. Shipping and Returns</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Please review our Shipping and Returns policies, which govern the delivery of products and our procedures for handling returns, exchanges, and refunds. Risk of loss and title for items purchased pass to you upon our delivery to the carrier.</p>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>5. Intellectual Property</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of Eco Theory Soap Co. or its content suppliers and protected by copyright, trademark, and other intellectual property laws.</p>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>6. Limitation of Liability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>To the fullest extent permitted by law, Eco Theory Soap Co. shall not be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from your use of, or inability to use, our site or products. Our liability is strictly limited to the purchase price of the product you purchased.</p>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>7. Changes to Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>We reserve the right to update, change or replace any part of these Terms of Service by posting updates to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website following the posting of any changes constitutes acceptance of those changes.</p>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>8. Governing Law</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the State of Minnesota, United States.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
