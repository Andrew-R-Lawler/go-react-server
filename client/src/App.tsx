import { useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Todo from './components/todo'
import Login from './components/login'
import HomePage from './components/homepage'
import UserRegistration from './components/registration'
import logo from '../src/assets/icons8-checkmark.svg'
import { CookiesProvider } from 'react-cookie'
import { useAuth } from './components/authentication'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import { Button } from './components/ui/button'

function App() {
    const { getToken, deleteToken } = useAuth()
    const [cookies, setCookie, removeCookie] = useCookies(['user', 'userid'])

    const getUser = async (token: string) => {
        try {
            const response = await axios.get('/api/protected/user', { headers: { Authorization: `Bearer ${token}`,},})
            const email = response.data 
            setCookie('user', email, {
                path: '/',
                maxAge: 24 * 60 * 60,
                secure: false,
                httpOnly: false,
            })
        } catch (err) {
            console.error(err)
        }
    }
    const getUserId = async (token: string) => {
        try {
            const response = await axios.get('/api/protected/id', { headers: { Authorization: `Bearer ${token}`,},})
            const id = response.data
            setCookie('userid', id, {
                path: '/',
                maxAge: 24 * 60 * 60,
                secure: false,
                httpOnly: false,
            })
        } catch (err) {
            console.error(err)
        }
    }
    const signOut = () => {
        console.log('signOut fired')
        removeCookie('userid')
        removeCookie('user')
        deleteToken()
        window.location.href = '/'
    }

    useEffect(() => {
        const token = getToken()
        getUser(token)
        getUserId(token)
    }, [])


  return (
      <CookiesProvider>
      <Router>
      <div>
        <nav className='nav-bar bg-black'>
          <ul className='nav-list'>
            <li className='nav-item'>
                <Link to="/">
                <img src={logo} width="40" height="40"/>
                </Link>
            </li>
            { cookies.user && 
                <>
                <li className='nav-item'>
                    <Link to="/todo">Todo</Link>
                </li>
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
          <Route path="/todo" element={<Todo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<UserRegistration />} />
        </Routes>
      </div>
    </Router>
    </CookiesProvider>
  )
}

export default App
