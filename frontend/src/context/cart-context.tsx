import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    sku?: string;
    variant_name?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any, variant?: any) => void;
    removeFromCart: (id: number, variant_name?: string) => void;
    updateQuantity: (id: number, quantity: number, variant_name?: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: any, variant?: any) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id && item.variant_name === (variant?.variant_name || undefined));
            if (existing) {
                return prev.map(item =>
                    item.id === product.id && item.variant_name === (variant?.variant_name || undefined)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.on_sale ? product.sale_price : product.price,
                image_url: product.images && product.images.length > 0 ? product.images[0] + `?t=${Date.now()}` : '',
                quantity: 1,
                sku: variant?.sku,
                variant_name: variant?.variant_name
            }];
        });
        setIsOpen(true); // Open cart when adding item
    };

    const removeFromCart = (id: number, variant_name?: string) => {
        setItems(prev => prev.filter(item => !(item.id === id && item.variant_name === variant_name)));
    };

    const updateQuantity = (id: number, quantity: number, variant_name?: string) => {
        if (quantity < 1) {
            removeFromCart(id, variant_name);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === id && item.variant_name === variant_name ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            isOpen,
            setIsOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
