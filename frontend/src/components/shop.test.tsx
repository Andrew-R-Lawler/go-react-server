import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Shop from './shop'
import { CartProvider } from '@/context/cart-context'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

// Mock axios
vi.mock('axios')

const mockProducts = [
    {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        image_url: 'http://example.com/image.jpg',
        price: 99.99,
        stock_quantity: 10,
        on_sale: false,
        sale_price: 0,
    },
]

describe('Shop Component', () => {
    it('renders products after fetching', async () => {
        // Setup mock response
        (axios.get as any).mockResolvedValue({ data: mockProducts })

        render(
            <HelmetProvider>
                <MemoryRouter>
                    <CartProvider>
                        <Shop />
                    </CartProvider>
                </MemoryRouter>
            </HelmetProvider>
        )

        // Loading state should be visible first
        // expect(screen.getByRole('status')).toBeInTheDocument() // If spinner has role='status'

        // Wait for products
        await waitFor(() => {
            expect(screen.getByText('Test Product')).toBeInTheDocument()
        })

        expect(screen.getByText('$99.99')).toBeInTheDocument()
    })
})
