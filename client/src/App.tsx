import { useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import Todo from './components/todo'
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
import AddProducts from './components/add-products'
import Shop from './components/shop'
import logo from '../src/assets/icons8-checkmark.svg'
import { CookiesProvider } from 'react-cookie'
import { useAuth } from './components/authentication'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import { Button } from './components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "./components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./components/ui/navigation-menu"

function App() {
    const { getToken, deleteToken, isAuthenticated } = useAuth()
    const [cookies, setCookie, removeCookie] = useCookies(['user', 'verified', 'admin'])

    const getUser = async (token: string) => {
        try {
            const response = await axios.get('/api/protected/user', { headers: { Authorization: `Bearer ${token}`,},})
            const user = response.data 
            setCookie('user', user, {
                path: '/',
                maxAge: 24 * 60 * 60,
                secure: false,
                httpOnly: false,
            })
            if (user.verified === true) {
                setCookie('verified', true, {
                    path: '/',
                    maxAge: 24*60*60,
                    secure: false,
                    httpOnly: false,
                })
            }
            if (user.admin === true) {
                setCookie('admin', true, {
                    path: '/',
                    maxAge: 24*60*60,
                    secure: false,
                    httpOnly: false,
                })
            }
        } catch (err) {
            console.error(err)
        }
    }
    const signOut = () => {
        console.log('signOut fired')
        removeCookie('user')
        removeCookie('verified')
        removeCookie('admin')
        deleteToken()
        window.location.href = '/'
    }

    useEffect(() => {
        const token = getToken()
        getUser(token)
    }, [])


  return (
      <CookiesProvider>
      <Router>
      <div className='chakra-petch-regular'>
        <nav className='nav-bar bg-black'>
          <ul className='nav-list'>
            <li className='nav-item'>
                <Link to="/">
                <img src={logo} width="30" height="30"/>
                </Link>
            </li>
            <li className='nav-item'>
                <Link to="/shop">Shop</Link>
            </li>
            { cookies.user && 
                <>
                <li className='nav-item'>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem className='text-white'>
                      <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                      <NavigationMenuContent className='bg-stone-700 text-white rounded-md'>
                        { cookies.verified && 
                            <Link to="/todo" className='link'>
                                <NavigationMenuLink className='link border-none w-30'>To-Do List</NavigationMenuLink>
                            </Link>
                        }
                        { cookies.admin && 
                            <NavigationMenuLink className='link border-none w-30' href="/add-products">Add Products</NavigationMenuLink>
                        }
                        <NavigationMenuLink className='link border-none w-30' onClick={signOut}>Sign Out</NavigationMenuLink>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                </li>
                </>
            }
            { !cookies.user &&
                <>
                <li className='nav-item'>
                    <Button>
                        <Link to="/login">Login</Link>
                    </Button>
                </li>
                </>
            }
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todo" element={isAuthenticated() && cookies.verified ? <Todo /> : <Forbidden />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/password-reset/:token" element={<PasswordReset />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-success" element={<ResetSuccess />} />
          <Route path="/email-sent" element={<EmailSent />} />
          <Route path='/registration-success' element={<RegisterSuccess />} />
          <Route path='/shop' element={<Shop />} />
          <Route path='/add-products' element={isAuthenticated() && cookies.admin ? <AddProducts /> : <Forbidden />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
    </CookiesProvider>
  )
}

export default App
