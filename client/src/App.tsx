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
import Shop from './components/shop'
import logo from '../src/assets/icons8-checkmark.svg'
import { CookiesProvider } from 'react-cookie'
import { useAuth } from './components/authentication'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import { Button } from './components/ui/button'

function App() {
    const { getToken, deleteToken, isAuthenticated } = useAuth()
    const [cookies, setCookie, removeCookie] = useCookies(['user', 'verified'])

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
        } catch (err) {
            console.error(err)
        }
    }
    const signOut = () => {
        console.log('signOut fired')
        removeCookie('user')
        removeCookie('verified')
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
            { cookies.verified === true && 
                <>
                <li className='nav-item'>
                    <Link to="/todo">Todo</Link>
                </li>
                </>
            }
            { cookies.user && 
                <>
                <li className='nav-item'>
                    <p className='text-white'>Hello! {cookies.user.email}</p>
                </li>
                <li className='nav-item'>
                    <Button onClick={signOut}>Sign Out</Button>
                </li>
                </>
            }
            { !cookies.user &&
                <>
                <li className='nav-item'>
                    <Link to="/login">Login</Link>
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
          <Route path="/passwordreset/:token" element={<PasswordReset />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-success" element={<ResetSuccess />} />
          <Route path="/email-sent" element={<EmailSent />} />
          <Route path='/registrationsuccess' element={<RegisterSuccess />} />
          <Route path='/shop' element={<Shop />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
    </CookiesProvider>
  )
}

export default App
