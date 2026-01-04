import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ManageProducts from './manage-products'
import axios from 'axios'
import { Product } from './admin-product-card'

// Mock axios
vi.mock('axios')

// Mock child components
vi.mock('./admin-product-card', () => ({
    default: ({ product }: { product: Product }) => <div data-testid="product-card">{product.name}</div>
}))

vi.mock('./product-dialog', () => ({
    ProductDialog: () => <button>Add New Product</button>
}))

describe('ManageProducts Component', () => {
    const mockProducts = [
        {
            id: 1,
            name: 'Product A',
            description: 'Desc A',
            price: 10,
            stock_quantity: 5,
            image_url: 'url',
            featured: false,
            on_sale: false,
            sale_price: 0
        },
        {
            id: 2,
            name: 'Product B',
            description: 'Desc B',
            price: 20,
            stock_quantity: 10,
            image_url: 'url',
            featured: true,
            on_sale: true,
            sale_price: 15
        }
    ]

    it('renders header and add button', async () => {
        (axios.get as any).mockResolvedValue({ data: [] })
        render(<ManageProducts />)

        expect(screen.getByText('Manage Products')).toBeInTheDocument()
        expect(screen.getByText('Add New Product')).toBeInTheDocument()
    })

    it('renders fetched products', async () => {
        (axios.get as any).mockResolvedValue({ data: mockProducts })
        render(<ManageProducts />)

        await waitFor(() => {
            expect(screen.getByText('Product A')).toBeInTheDocument()
            expect(screen.getByText('Product B')).toBeInTheDocument()
        })
    })

    it('shows empty state message when no products', async () => {
        (axios.get as any).mockResolvedValue({ data: [] })
        render(<ManageProducts />)

        await waitFor(() => {
            expect(screen.getByText('No products found. Start by adding one!')).toBeInTheDocument()
        })
    })
})
