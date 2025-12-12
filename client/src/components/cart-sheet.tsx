import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function CartSheet() {
    const { items, removeFromCart, updateQuantity, cartTotal, isOpen, setIsOpen, clearCart } = useCart()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Slide-over Panel */}
            <div className="relative z-50 w-full max-w-md h-full bg-background border-l shadow-xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Shopping Cart
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="w-5 h-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                            <p>Your cart is empty</p>
                            <Button variant="link" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-xs">No Img</div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col">
                                    <div className="flex justify-between text-base font-medium">
                                        <h3 className="line-clamp-1">{item.name}</h3>
                                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>

                                    <div className="flex-1 flex items-end justify-between text-sm mt-2">
                                        <div className="flex items-center gap-2 border rounded-md p-1">
                                            <button
                                                className="p-1 hover:bg-accent rounded-sm disabled:opacity-50"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-4 text-center">{item.quantity}</span>
                                            <button
                                                className="p-1 hover:bg-accent rounded-sm"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t p-4 space-y-4 bg-muted/20">
                        <div className="flex justify-between text-base font-medium">
                            <p>Subtotal</p>
                            <p>${cartTotal.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                        <div className="grid gap-2">
                            <Link to="/checkout" onClick={() => setIsOpen(false)}>
                                <Button className="w-full text-lg py-6">Checkout</Button>
                            </Link>
                            <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
