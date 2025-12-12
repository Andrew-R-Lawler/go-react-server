import { useEffect, useState } from 'react'
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
import logo from '@/assets/path6.svg'
import { CookiesProvider } from 'react-cookie'
import axios from 'axios'
import { Button } from './components/ui/button'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,

    NavigationMenuList,
    NavigationMenuTrigger,
} from "./components/ui/navigation-menu"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { CartProvider, useCart } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { ShoppingBag } from "lucide-react"

function App() {

    interface User {
        id: number;
        email: string;
        admin: boolean;
        verified: boolean;
    }

    const [user, setUser] = useState<User | null>(null);

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
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <CookiesProvider>
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
                                                <NavigationMenu>
                                                    <NavigationMenuList>
                                                        <NavigationMenuItem>
                                                            <NavigationMenuTrigger className="bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent/50">Account</NavigationMenuTrigger>
                                                            <NavigationMenuContent className='min-w-[150px] p-2'>
                                                                {user.verified &&
                                                                    <>
                                                                        {/* <Link to="/todo" className='block p-2 hover:bg-accent rounded-sm text-sm'>
                                                                        To-Do List
                                                                    </Link> */}
                                                                        <Link to="/orders" className='block p-2 hover:bg-accent rounded-sm text-sm'>
                                                                            My Orders
                                                                        </Link>
                                                                    </>
                                                                }
                                                                {user.admin &&
                                                                    <Link to="/manage-products" className='block p-2 hover:bg-accent rounded-sm text-sm'>
                                                                        Manage Products
                                                                    </Link>
                                                                }
                                                                <div className='block p-2 hover:bg-accent rounded-sm text-sm cursor-pointer' onClick={signOut}>
                                                                    Sign Out
                                                                </div>
                                                            </NavigationMenuContent>
                                                        </NavigationMenuItem>
                                                    </NavigationMenuList>
                                                </NavigationMenu>
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
                                <Route path='/completion' element={<Completion />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </Router>
                </CartProvider>
            </CookiesProvider>
        </ThemeProvider>
    )
}

export default App
