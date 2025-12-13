import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { Link } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"
import { loadStripe, Stripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, AddressElement, LinkAuthenticationElement, useStripe, useElements } from "@stripe/react-stripe-js"
import axios from "axios"
import { User, Lock } from "lucide-react"

// Revert to standard function to ensure render stability
function CheckoutForm({ total, userEmail, isPaymentUpdating }: { total: number, userEmail?: string, isPaymentUpdating: boolean }) {
    console.log("Rendering CheckoutForm", { total, userEmail, isPaymentUpdating })
    const stripe = useStripe()
    const elements = useElements()
    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsLoading(true)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your actual return URL
                return_url: `${window.location.origin}/completion`,
                receipt_email: userEmail,
            },
        })

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An unexpected error occurred.")
        } else {
            setMessage("An unexpected error occurred.")
        }

        setIsLoading(false)
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            {!userEmail && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <LinkAuthenticationElement />
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Shipping Address</h3>
                <AddressElement options={{ mode: 'shipping' }} />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Details</h3>
                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            </div>

            <Button disabled={isLoading || !stripe || !elements || isPaymentUpdating} id="submit" className="w-full text-lg py-6">
                <span id="button-text">
                    {isLoading || isPaymentUpdating ? (
                        <div className="flex items-center gap-2">
                            <div className="spinner" id="spinner"></div>
                            {isPaymentUpdating ? "Updating Total..." : "Processing..."}
                        </div>
                    ) : `Pay $${total.toFixed(2)}`}
                </span>
            </Button>
            {/* Show any error or success messages */}
            {message && <div id="payment-message" className="text-red-500 mt-4 text-sm font-medium">{message}</div>}
        </form>
    )
}

function Checkout() {
    const { items, cartTotal } = useCart()
    // Shipping State
    const [selectedShipping, setSelectedShipping] = useState("standard")

    const shippingOptions = {
        standard: { id: "standard", label: "Standard Shipping", price: 5.00 },
        express: { id: "express", label: "Express Shipping", price: 10.00 }
    }

    const shippingCost = shippingOptions[selectedShipping as keyof typeof shippingOptions].price
    const total = cartTotal + shippingCost

    const [clientSecret, setClientSecret] = useState("")
    console.log("Checkout State:", { itemsLength: items.length, clientSecret, total })
    const [initError, setInitError] = useState<string | null>(null)
    const [isPaymentUpdating, setIsPaymentUpdating] = useState(false)

    // Auth State
    const [isGuest, setIsGuest] = useState(false)
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    // Stripe State
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

    // Theme State
    const { theme } = useTheme()
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        const isDark = theme === "dark" ||
            (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
        setIsDarkMode(isDark)
    }, [theme])

    useEffect(() => {
        // Fetch Stripe Key
        const fetchConfig = async () => {
            try {
                const { data } = await axios.get("/api/config")
                const key = data.stripePublishableKey
                console.log("Stripe Config Fetched:", { key: key ? "PRESENT" : "MISSING", keyLength: key?.length })

                if (key) {
                    setStripePromise(loadStripe(key))
                } else {
                    console.error("Stripe key is missing from backend config")
                    // Optionally set an error state here
                }
            } catch (error) {
                console.error("Error fetching stripe config:", error)
            }
        }
        fetchConfig()
    }, [])

    useEffect(() => {
        // Build robust auth check
        const checkAuth = async () => {
            try {
                const res = await axios.get('/api/protected/user', { withCredentials: true })
                if (res.status === 200) {
                    setIsLoggedIn(true)
                    setUserEmail(res.data.email)
                }
            } catch (err) {
                // Not logged in (401), stay false
                setIsLoggedIn(false)
            } finally {
                setIsCheckingAuth(false)
            }
        }
        checkAuth()
    }, [])

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        if (items.length > 0) {
            setIsPaymentUpdating(true)
            axios.post("/api/create-payment-intent", {
                items: items,
                shipping_id: selectedShipping
            })
                .then((res) => setClientSecret(res.data.clientSecret))
                .catch((err) => {
                    console.error("Error creating payment intent:", err)
                    setInitError("Failed to initialize payment. Please try again later.")
                })
                .finally(() => setIsPaymentUpdating(false))
        }
    }, [items, selectedShipping]) // Re-run when shipping changes

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <p className="text-muted-foreground">Add items to your cart to proceed to checkout.</p>
                <Link to="/shop">
                    <Button>Return to Shop</Button>
                </Link>
            </div>
        )
    }

    // Loading State for Auth Check or Stripe Key
    if (isCheckingAuth || !stripePromise) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // AUTH GATE
    if (!isLoggedIn && !isGuest) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-12 px-4">
                <Card className="w-full max-w-md border-border">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Checkout</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-center">Returning Customer?</h3>
                            <Link to="/login" state={{ from: "/checkout" }}>
                                <Button className="w-full text-lg" variant="default">
                                    <User className="mr-2 h-4 w-4" />
                                    Log In to Account
                                </Button>
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-center">New Customer?</h3>
                            <Button className="w-full text-lg" variant="outline" onClick={() => setIsGuest(true)}>
                                Continue as Guest
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground text-center">
                            <Lock className="inline h-3 w-3 mr-1" />
                            Secure Checkout
                        </p>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                {/* Left Column: Stripe Elements */}
                <div className="space-y-8">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle>Secure Checkout</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Shipping Selection */}
                            <div className="mb-8 space-y-4">
                                <h3 className="text-lg font-medium">Shipping Method</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {Object.values(shippingOptions).map((option) => (
                                        <div
                                            key={option.id}
                                            className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${selectedShipping === option.id
                                                ? 'border-primary ring-2 ring-primary'
                                                : 'border-border'
                                                }`}
                                            onClick={() => setSelectedShipping(option.id)}
                                        >
                                            <div className="flex w-full items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="text-sm">
                                                        <p className="font-medium text-foreground">{option.label}</p>
                                                        <p className="text-muted-foreground">
                                                            {option.id === 'standard' ? '3-5 Business Days' : '1-2 Business Days'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium text-primary">
                                                    ${option.price.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {initError ? (
                                <div className="text-destructive text-center py-8">
                                    <p>{initError}</p>
                                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
                                </div>
                            ) : clientSecret && stripePromise ? (
                                <Elements key={clientSecret} options={{
                                    clientSecret,
                                    appearance: {
                                        theme: isDarkMode ? 'night' : 'stripe',
                                        variables: {
                                            colorPrimary: '#16a34a',
                                            colorBackground: isDarkMode ? '#0a0a0a' : '#ffffff',
                                            colorText: isDarkMode ? '#fafafa' : '#0a0a0a',
                                            borderRadius: '0.5rem',
                                        },
                                        labels: 'floating',
                                    }
                                }} stripe={stripePromise}>
                                    <div className="min-h-[300px]">
                                        <CheckoutForm total={total} userEmail={userEmail} isPaymentUpdating={isPaymentUpdating} />
                                    </div>
                                </Elements>
                            ) : (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Order Summary */}
                <div>
                    <Card className="border-border sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Product List */}
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0">
                                            {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping ({shippingOptions[selectedShipping as keyof typeof shippingOptions].label})</span>
                                    <span>${shippingCost.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <p className="text-xs text-muted-foreground text-center w-full">Protected by Stripe</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Checkout
