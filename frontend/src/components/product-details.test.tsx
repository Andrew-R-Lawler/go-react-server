import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProductDetails from './product-details'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import * as CartContext from '@/context/cart-context'
import axios from 'axios'

// Mock axios
vi.mock('axios')

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

// Mock CartContext
vi.mock('@/context/cart-context', async () => {
    const actual = await vi.importActual('@/context/cart-context')
    return {
        ...actual,
        useCart: vi.fn(),
    }
})

describe('ProductDetails Component', () => {
    const mockAddToCart = vi.fn()
    const mockProduct = {
        id: 1,
        name: 'Detailed Product',
        description: 'Short desc',
        long_description: 'Long detailed description',
        image_url: 'http://example.com/img.jpg',
        price: 199.99,
        stock_quantity: 5,
        on_sale: false,
        sale_price: 0,
    }

    beforeEach(() => {
        vi.clearAllMocks()
            ; (CartContext.useCart as any).mockReturnValue({
                addToCart: mockAddToCart,
            })
    })

    const renderComponent = (id = '1') => {
        render(
            <HelmetProvider>
                <MemoryRouter initialEntries={[`/product/${id}`]}>
                    <Routes>
                        <Route path="/product/:id" element={<ProductDetails />} />
                    </Routes>
                </MemoryRouter>
            </HelmetProvider>
        )
    }

    it('shows loading state initially', () => {
        (axios.get as any).mockImplementation(() => new Promise(() => { })) // Never resolves
        renderComponent()
        expect(screen.getByText('Loading product...')).toBeInTheDocument()
    })

    it('renders product details after fetch', async () => {
        (axios.get as any).mockResolvedValue({ data: mockProduct })
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Detailed Product')).toBeInTheDocument()
        })
        expect(screen.getByText('$199.99')).toBeInTheDocument()
        expect(screen.getByText('Long detailed description')).toBeInTheDocument()
    })

    it('falls back to short description if long description is missing', async () => {
        const productWithShortDesc = { ...mockProduct, long_description: '' }
            ; (axios.get as any).mockResolvedValue({ data: productWithShortDesc })
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Short desc')).toBeInTheDocument()
        })
    })

    it('adds product to cart', async () => {
        (axios.get as any).mockResolvedValue({ data: mockProduct })
        renderComponent()

        await waitFor(() => expect(screen.getByText('Detailed Product')).toBeInTheDocument())

        const addButton = screen.getByText('Add to Cart')
        fireEvent.click(addButton)

        expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, null)
    })

    it('selects a variant and adds to cart', async () => {
        const productWithSkus = {
            ...mockProduct,
            skus: [{ sku: 'SKU1', variant_name: 'Small', stock_quantity: 5 }]
        }
            ; (axios.get as any).mockResolvedValue({ data: productWithSkus })
        renderComponent()

        await waitFor(() => expect(screen.getByText('Detailed Product')).toBeInTheDocument())

        // Select variant
        const variantButton = screen.getByText('Small')
        fireEvent.click(variantButton)

        const addButton = screen.getByText('Add to Cart')
        fireEvent.click(addButton)

        expect(mockAddToCart).toHaveBeenCalledWith(productWithSkus, expect.objectContaining({ variant_name: 'Small' }))
    })

    it('navigates back when Back button is clicked', async () => {
        (axios.get as any).mockResolvedValue({ data: mockProduct })
        renderComponent()

        await waitFor(() => expect(screen.getByText('Detailed Product')).toBeInTheDocument())

        const backButton = screen.getByText('Back')
        fireEvent.click(backButton)

        expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
})

