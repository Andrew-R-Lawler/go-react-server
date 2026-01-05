import { useEffect, useState, useContext } from 'react';
import { CookieConsentContext, CookieConsentProvider } from '@/context/cookie-consent-context';
import { CookieConsent } from '@/components/CookieConsent';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/header'
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
import AssetsManager from './components/assets-manager'
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
import OrderFulfillment from './components/order-fulfillment'
import ProductDetails from './components/product-details'
import { CookiesProvider } from 'react-cookie'
import axios from 'axios'
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"


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


    return (
        <CartProvider>
            <Router>
                <div className='min-h-screen bg-background text-foreground transition-colors duration-300'>
                    <Header user={user} signOut={signOut} />
                    <CartSheet />
                    <Routes>
                        {/* ... existing routes */}
                        <Route path="/" element={<HomePage />} />
                        {/* <Route path="/todo" element={isAdmin() ? <Todo /> : <Forbidden />} /> */}
                        {/* <Route path="/admin" element={isAdmin() ? <ManageProducts /> : <Forbidden />} /> */}
                        <Route path="/manage-assets" element={isAdmin() ? <AssetsManager /> : <Forbidden />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<UserRegistration />} />
                        <Route path="/verify" element={<Verification />} />
                        <Route path="/password-reset/:token" element={<PasswordReset />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-success" element={<ResetSuccess />} />
                        <Route path="/email-sent" element={<EmailSent />} />
                        <Route path='/registration-success' element={<RegisterSuccess />} />
                        <Route path='/shop' element={<Shop />} />
                        <Route path='/product/:id' element={<ProductDetails />} />
                        <Route path='/about' element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path='/checkout' element={<Checkout />} />
                        <Route path='/manage-products' element={isAdmin() ? <ManageProducts /> : <Forbidden />} />
                        <Route path='/order-fulfillment' element={isAdmin() ? <OrderFulfillment /> : <Forbidden />} />
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
