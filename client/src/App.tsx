import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Todo from './components/todo'
import Login from './components/login'
import logo from '../src/assets/icons8-checkmark.svg'

function App() {

  return (
      <Router>
      <div>
        <nav className='nav-bar bg-black'>
          <ul className='nav-list'>
            <li className='nav-item'>
                <img src={logo} width="40" height="40"/>
            </li>
            <li className='nav-item'>
                <Link to="/todo">Todo</Link>
            </li>
            <li className='nav-item'>
                <Link to="/">Login</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/todo" element={<Todo />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
