import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Todo from './components/todo'
import Login from './components/login'
import HomePage from './components/homepage'
import logo from '../src/assets/icons8-checkmark.svg'

function App() {

  return (
      <Router>
      <div>
        <nav className='nav-bar bg-black'>
          <ul className='nav-list'>
            <li className='nav-item'>
                <Link to="/">
                <img src={logo} width="40" height="40"/>
                </Link>
            </li>
            <li className='nav-item'>
                <Link to="/todo">Todo</Link>
            </li>
            <li className='nav-item'>
                <Link to="/login">Login</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
