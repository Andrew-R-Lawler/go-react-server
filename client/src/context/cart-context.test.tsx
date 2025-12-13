import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from './cart-context';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('CartContext', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('provides initial empty state', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        expect(result.current.items).toEqual([]);
        expect(result.current.cartCount).toBe(0);
        expect(result.current.cartTotal).toBe(0);
    });

    it('adds an item to the cart', async () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Test Product', price: 10, image_url: 'http://example.com/img.jpg' };

        act(() => {
            result.current.addToCart(product);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0]).toMatchObject({ ...product, quantity: 1 });
        expect(result.current.cartCount).toBe(1);
        expect(result.current.cartTotal).toBe(10);
        expect(result.current.isOpen).toBe(true);
    });

    it('increments quantity when adding duplicate item', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Test Product', price: 10, image_url: 'http://example.com/img.jpg' };

        act(() => {
            result.current.addToCart(product);
        });
        act(() => {
            result.current.addToCart(product);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(2);
        expect(result.current.cartCount).toBe(2);
        expect(result.current.cartTotal).toBe(20);
    });

    it('updates item quantity', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Test Product', price: 10, image_url: 'http://example.com/img.jpg' };

        act(() => {
            result.current.addToCart(product);
        });

        act(() => {
            result.current.updateQuantity(1, 5);
        });

        expect(result.current.items[0].quantity).toBe(5);
        expect(result.current.cartCount).toBe(5);
        expect(result.current.cartTotal).toBe(50);
    });

    it('removes item from cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Test Product', price: 10, image_url: 'http://example.com/img.jpg' };

        act(() => {
            result.current.addToCart(product);
        });

        act(() => {
            result.current.removeFromCart(1);
        });

        expect(result.current.items).toHaveLength(0);
        expect(result.current.cartCount).toBe(0);
    });

    it('clears the cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Test Product', price: 10, image_url: 'http://example.com/img.jpg' };

        act(() => {
            result.current.addToCart(product);
        });

        act(() => {
            result.current.clearCart();
        });

        expect(result.current.items).toHaveLength(0);
        expect(result.current.cartCount).toBe(0);
    });

    it('persists cart to localStorage', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Test Product', price: 10, image_url: 'http://example.com/img.jpg' };

        act(() => {
            result.current.addToCart(product);
        });

        expect(localStorageMock.setItem).toHaveBeenCalled();
        expect(localStorageMock.setItem).toHaveBeenCalledWith('cart', expect.stringContaining('Test Product'));
    });

    it('uses sale price when product is on sale', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = {
            id: 2,
            name: 'Sale Product',
            price: 100,
            on_sale: true,
            sale_price: 80,
            image_url: 'http://example.com/img.jpg'
        };

        act(() => {
            result.current.addToCart(product);
        });

        expect(result.current.cartTotal).toBe(80);
        expect(result.current.items[0].price).toBe(80);
    });
});
