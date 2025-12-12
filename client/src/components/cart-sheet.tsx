import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Fragment } from "react"

export function CartSheet() {
    const { items, removeFromCart, updateQuantity, cartTotal, isOpen, setIsOpen, clearCart } = useCart()



    // Helper function to toggle cart visibility
    const toggleCart = () => setIsOpen(!isOpen);

    if (!isOpen) return null

    return (
        <Fragment>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-all duration-300"
                    onClick={toggleCart}
                />
            )}

            {/* Sheet */}
            <div className={`fixed right-0 top-0 h-full w-[400px] bg-card border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Shopping Cart</h2>
                        <Button variant="ghost" size="icon" onClick={toggleCart} className="hover:bg-accent text-muted-foreground hover:text-foreground">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                                <ShoppingBag className="w-12 h-12 opacity-20" />
                                <p>Your cart is empty</p>
                                <Button variant="link" onClick={toggleCart}>Continue Shopping</Button>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="flex gap-4 pb-6 border-b border-border last:border-0 last:pb-0">
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
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
                                        <div className="flex justify-between text-base font-medium text-foreground">
                                            <h3 className="line-clamp-2">{item.name}</h3>
                                            <p className="ml-4 whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>

                                        <div className="flex-1 flex items-end justify-between text-sm mt-4">
                                            <div className="flex items-center gap-2 border border-border rounded-md p-1 bg-card">
                                                <button
                                                    className="p-1 hover:bg-accent rounded-sm disabled:opacity-50 text-foreground"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-6 text-center text-foreground font-medium">{item.quantity}</span>
                                                <button
                                                    className="p-1 hover:bg-accent rounded-sm text-foreground"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2"
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
                        <div className="border-t border-border p-6 space-y-4 bg-muted/20">
                            <div className="flex justify-between items-center text-lg font-semibold text-foreground">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">Shipping and taxes calculated at checkout.</p>
                            <Link to="/checkout" onClick={toggleCart} className="block w-full">
                                <Button className="w-full text-lg py-6" size="lg">
                                    Checkout
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full" onClick={clearCart}>
                                Clear Cart
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    )
}
