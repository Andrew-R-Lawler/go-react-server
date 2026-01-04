import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Header } from './header'
import { MemoryRouter } from 'react-router-dom'
import * as CartContext from '@/context/cart-context'
import userEvent from '@testing-library/user-event'

// Mock start
vi.mock('@/context/cart-context', async () => {
    const actual = await vi.importActual('@/context/cart-context')
    return {
        ...actual,
        useCart: vi.fn(),
    }
})

describe('Header Component', () => {
    const mockSetIsOpen = vi.fn()
    const defaultUser = {
        id: 1,
        email: 'test@example.com',
        admin: false,
        verified: true,
    }

    beforeEach(() => {
        vi.clearAllMocks()
            // Default mock implementation
            ; (CartContext.useCart as any).mockReturnValue({
                setIsOpen: mockSetIsOpen,
                cartCount: 0,
            })
    })

    it('renders logo and shop link', () => {
        render(
            <MemoryRouter>
                <Header user={null} signOut={vi.fn()} />
            </MemoryRouter>
        )
        expect(screen.getByAltText('Logo')).toBeInTheDocument()
        expect(screen.getByText('Shop')).toBeInTheDocument()
    })

    it('shows login button when user is null', () => {
        render(
            <MemoryRouter>
                <Header user={null} signOut={vi.fn()} />
            </MemoryRouter>
        )
        expect(screen.getByText('Login')).toBeInTheDocument()
        expect(screen.queryByText('Account')).not.toBeInTheDocument()
    })

    it('shows account dropdown when user is logged in', () => {
        render(
            <MemoryRouter>
                <Header user={defaultUser} signOut={vi.fn()} />
            </MemoryRouter>
        )
        expect(screen.queryByText('Login')).not.toBeInTheDocument()
        expect(screen.getByText('Account')).toBeInTheDocument()
    })

    it('opens cart sheet when cart trigger is clicked', async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter>
                <Header user={null} signOut={vi.fn()} />
            </MemoryRouter>
        )
        const cartButton = screen.getByText('Open cart') // sr-only text
        await user.click(cartButton)
        expect(mockSetIsOpen).toHaveBeenCalledWith(true)
    })

    it('displays cart count badge', () => {
        ; (CartContext.useCart as any).mockReturnValue({
            setIsOpen: mockSetIsOpen,
            cartCount: 5,
        })

        render(
            <MemoryRouter>
                <Header user={null} signOut={vi.fn()} />
            </MemoryRouter>
        )
        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('shows admin links for admin user', async () => {
        const user = userEvent.setup()
        const adminUser = { ...defaultUser, admin: true }
        render(
            <MemoryRouter>
                <Header user={adminUser} signOut={vi.fn()} />
            </MemoryRouter>
        )

        // Open dropdown
        const accountButton = screen.getByText('Account')
        await user.click(accountButton)

        expect(await screen.findByText('Manage Products')).toBeInTheDocument()
        expect(await screen.findByText('Order Fulfillment')).toBeInTheDocument()
    })

    it('calls signOut when logout is clicked', async () => {
        const user = userEvent.setup()
        const mockSignOut = vi.fn()
        render(
            <MemoryRouter>
                <Header user={defaultUser} signOut={mockSignOut} />
            </MemoryRouter>
        )

        const accountButton = screen.getByText('Account')
        await user.click(accountButton)

        const logoutButton = await screen.findByText('Logout')
        await user.click(logoutButton)

        expect(mockSignOut).toHaveBeenCalled()
    })
})
