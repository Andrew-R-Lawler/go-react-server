import { useEffect, useState, useContext } from 'react';
import { CookieConsentContext, CookieConsentProvider } from '@/context/cookie-consent-context';
import { CookieConsent } from '@/components/CookieConsent';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
// import Todo from './components/todo'
import Login from './components/login'
import HomePage from './components/homepage'
import UserRegistration from './components/registration'
import Verification from './components/verification'
import PasswordReset from './components/password-reset'
import ForgotPassword from './components/forgotpassword'
import ResetSuccess from './components/reset-success'
import EmailSent from './components/email-sent'
import RegisterSuccess from './components/register-success'
import Forbidden from './components/forbidden'
import ManageProducts from './components/manage-products'
import Shop from './components/shop'
import Checkout from './components/checkout'
import About from './components/about'
import Contact from './components/contact'
import Completion from './components/completion'
import Orders from './components/orders'
import FAQ from './components/faq'
import Shipping from './components/shipping'
import Returns from './components/returns'
import NewArrivals from './components/new-arrivals'
import Careers from './components/careers'
import logo from '@/assets/path6.svg'
import { CookiesProvider } from 'react-cookie'
import axios from 'axios'
import { Button } from './components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { CartProvider, useCart } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { ShoppingBag } from "lucide-react"

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <CookiesProvider>
                <CookieConsentProvider>
                    <AppContent />
                </CookieConsentProvider>
            </CookiesProvider>
        </ThemeProvider>
    )
}

function AppContent() {
    interface User {
        id: number;
        email: string;
        admin: boolean;
        verified: boolean;
    }

    const [user, setUser] = useState<User | null>(null);
    const { consentGiven } = useContext(CookieConsentContext);

    const getUser = async () => {
        try {
            const response = await axios.get('/api/protected/user', { withCredentials: true })
            const user = response.data
            setUser(user)
        } catch (err) {
            console.error(err)
        }
    }

    const isAdmin = () => {
        if (!user) {
            return false
        }
        if (user.admin === false) {
            return false
        }
        if (user.admin === true) {
            return true
        }
    }

    const signOut = async () => {
        try {
            const response = await axios.post('/api/protected/logout', { withCredentials: true })
            if (response.data.message === "Logged out") {
                window.location.href = '/'
            }
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    useEffect(() => {
        getUser()
    }, [])

    const CartTrigger = () => {
        const { setIsOpen, cartCount } = useCart()
        return (
            <Button variant="ghost" size="icon" className="relative text-foreground" onClick={() => setIsOpen(true)}>
                <ShoppingBag className="h-[1.2rem] w-[1.2rem]" />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {cartCount}
                    </span>
                )}
                <span className="sr-only">Open cart</span>
            </Button>
        )
    }

    return (
        <CartProvider>
            <Router>
                <div className='min-h-screen bg-background text-foreground transition-colors duration-300'>
                    <nav className='sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b border-border shadow-sm transition-colors duration-300'>
                        <ul className='flex justify-end items-center gap-6 max-w-7xl mx-auto'>
                            <li className='mr-auto'>
                                <Link to="/">
                                    <img src={logo} width="30" height="30" alt="Logo" className="hover:opacity-80 transition-opacity invert dark:invert-0" />
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop" className='hover:text-muted-foreground transition-colors'>Shop</Link>
                            </li>
                            {user &&
                                <>
                                    <li>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost">
                                                    Account
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-card border-border">
                                                {user.verified && (
                                                    <DropdownMenuItem asChild>
                                                        <Link to="/orders" className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                                            My Orders
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {user.admin && (
                                                    <DropdownMenuItem asChild>
                                                        <Link to="/manage-products" className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                                            Manage Products
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10">
                                                    Logout
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </li>
                                </>
                            }
                            {!user &&
                                <>
                                    <li>
                                        <Button variant="outline" className="bg-transparent border-input hover:bg-accent hover:text-accent-foreground transition-colors">
                                            <Link to="/login">Login</Link>
                                        </Button>
                                    </li>
                                </>
                            }
                            <li>
                                <ModeToggle />
                            </li>
                            <li>
                                <span className="text-xs text-muted-foreground">v1.1.9</span>
                            </li>
                            <li>
                                <CartTrigger />
                            </li>
                        </ul>
                    </nav>
                    <CartSheet />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        {/* <Route path="/todo" element={isAdmin() ? <Todo /> : <Forbidden />} /> */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<UserRegistration />} />
                        <Route path="/verify" element={<Verification />} />
                        <Route path="/password-reset/:token" element={<PasswordReset />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-success" element={<ResetSuccess />} />
                        <Route path="/email-sent" element={<EmailSent />} />
                        <Route path='/registration-success' element={<RegisterSuccess />} />
                        <Route path='/shop' element={<Shop />} />
                        <Route path='/about' element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path='/checkout' element={<Checkout />} />
                        <Route path='/manage-products' element={isAdmin() ? <ManageProducts /> : <Forbidden />} />
                        <Route path='/orders' element={<Orders />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/shipping" element={<Shipping />} />
                        <Route path="/returns" element={<Returns />} />
                        <Route path="/new-arrivals" element={<NewArrivals />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path='/completion' element={<Completion />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
                {/* Overlay blocking UI until cookie consent is given */}
                {consentGiven !== true && (
                    <div className="fixed inset-0 bg-background/80 flex flex-col items-center justify-center z-50">
                        <CookieConsent />
                    </div>
                )}
            </Router>
        </CartProvider>
    )
}

export default App
