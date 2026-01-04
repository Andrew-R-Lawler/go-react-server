import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from './footer'
import { MemoryRouter } from 'react-router-dom'

describe('Footer Component', () => {
    it('renders all sections', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        )
        expect(screen.getByText('Shop')).toBeInTheDocument()
        expect(screen.getByText('Support')).toBeInTheDocument()
        expect(screen.getByText('Company')).toBeInTheDocument()
        expect(screen.getByText('Connect')).toBeInTheDocument()
    })

    it('renders important links', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        )
        expect(screen.getByText('All Products')).toBeInTheDocument()
        expect(screen.getByText('FAQ')).toBeInTheDocument()
        expect(screen.getByText('About Us')).toBeInTheDocument()
    })

    it('renders copyright text', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        )
        const year = new Date().getFullYear()
        expect(screen.getByText(new RegExp(`${year} Lorem Ipsum Store`, 'i'))).toBeInTheDocument()
    })
})
