import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useCart } from "@/context/cart-context";
import { loadStripe } from "@stripe/stripe-js";
import { Separator } from "./ui/separator";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function Completion() {
    const [searchParams] = useSearchParams();
    const redirectStatus = searchParams.get("redirect_status");
    const clientSecret = searchParams.get("payment_intent_client_secret");

    const [status, setStatus] = useState<"success" | "processing" | "fail" | "loading">("loading");
    const { clearCart, items } = useCart();

    // We capture items in a local state so we can display them even after clearing the cart
    const [finalItems, setFinalItems] = useState(items);
    const [paymentDetails, setPaymentDetails] = useState<{ amount: number, shipping: string } | null>(null);
    const orderConfirmed = useRef(false);

    useEffect(() => {
        // If we have items in the cart context and we are successful, save them before clearing
        if (items.length > 0 && (status === 'success' || redirectStatus === 'succeeded')) {
            setFinalItems(items);
        }
    }, [items, status, redirectStatus]);

    useEffect(() => {
        if (!stripePromise || !clientSecret) {
            return;
        }

        stripePromise.then(async (stripe) => {
            if (!stripe) return;

            const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

            if (!paymentIntent) {
                setStatus("fail");
                return;
            }

            switch (paymentIntent.status) {
                case "succeeded":
                    setStatus("success");
                    // Extract details
                    setPaymentDetails({
                        amount: paymentIntent.amount / 100,
                        shipping: (paymentIntent as any).metadata?.shipping_id || "standard"
                    });

                    if (orderConfirmed.current) return;
                    orderConfirmed.current = true;

                    // Confirm order (decrement stock)
                    // We don't await this to avoid blocking the UI, but in a real app better error handling is needed
                    fetch("/api/confirm-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ payment_intent_id: paymentIntent.id }),
                    });

                    clearCart();
                    break;
                case "processing":
                    setStatus("processing");
                    break;
                case "requires_payment_method":
                    setStatus("fail");
                    break;
                default:
                    setStatus("fail");
                    break;
            }
        });
    }, [clientSecret, redirectStatus, clearCart]);

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 py-12">
            <Card className="w-full max-w-md border-border">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === "success" && <CheckCircle2 className="w-16 h-16 text-primary" />}
                        {status === "processing" && <AlertCircle className="w-16 h-16 text-yellow-500" />}
                        {status === "fail" && <XCircle className="w-16 h-16 text-destructive" />}
                        {status === "loading" && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === "success" && "Order Confirmed!"}
                        {status === "processing" && "Processing Order"}
                        {status === "fail" && "Payment Failed"}
                        {status === "loading" && "Verifying..."}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center text-muted-foreground">
                        {status === "success" && "Thank you for your purchase. A confirmation email has been sent."}
                        {status === "processing" && "We are verifying your payment. You will receive an email once it's confirmed."}
                        {status === "fail" && "We couldn't process your payment. Please try again."}
                    </div>

                    {status === "success" && paymentDetails && (
                        <div className="space-y-4 pt-4">
                            <h3 className="font-medium text-lg">Order Details</h3>

                            {/* Items List (if preserved) */}
                            {finalItems.length > 0 && (
                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 border rounded-md p-2 bg-muted/20">
                                    {finalItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="truncate pr-4">{item.name} (x{item.quantity})</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping Method</span>
                                    <span className="capitalize">{paymentDetails.shipping === 'express' ? 'Express' : 'Standard'}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t">
                                    <span>Total Paid</span>
                                    <span>${paymentDetails.amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    {status === "success" && (
                        <Link to="/shop" className="w-full">
                            <Button className="w-full">Continue Shopping</Button>
                        </Link>
                    )}
                    {(status === "fail" || status === "processing") && (
                        <Link to="/checkout" className="w-full">
                            <Button variant="outline" className="w-full">Return to Checkout</Button>
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

export default Completion;
