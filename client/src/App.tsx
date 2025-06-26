import { useEffect, useState } from 'react'
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
import logo from '../src/assets/path6.svg'
import { CookiesProvider } from 'react-cookie'
import axios from 'axios'
import { Button } from './components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./components/ui/navigation-menu"

function App() {

    interface User {
        id: number;
        email: string;
        admin: boolean;
        verified: boolean;
    }

    const [ user, setUser ] = useState<User | null>(null);

    const getUser = async () => {
        try {
            const response = await axios.get('/api/protected/user', { withCredentials: true })
            const user = response.data 
            setUser(user)
        } catch (err) {
            console.error(err)
        }
    }
    
    const signOut = () => {
        window.location.href = '/'    
    }

    useEffect(() => {
        getUser()
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
            { user && 
                <>
                <li className='nav-item'>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem className='text-white'>
                      <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                      <NavigationMenuContent className='bg-stone-700 text-white rounded-md'>
                        { user.verified && 
                            <Link to="/todo" className='link'>
                                <NavigationMenuLink className='link border-none w-30'>To-Do List</NavigationMenuLink>
                            </Link>
                        }
                        { user.admin && 
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
            { !user &&
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
          <Route path="/todo" element={<Todo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/password-reset/:token" element={<PasswordReset />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-success" element={<ResetSuccess />} />
          <Route path="/email-sent" element={<EmailSent />} />
          <Route path='/registration-success' element={<RegisterSuccess />} />
          <Route path='/shop' element={<Shop />} />
          <Route path='/add-products' element={<AddProducts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
    </CookiesProvider>
  )
}

export default App
