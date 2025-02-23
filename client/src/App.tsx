import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Todo from './components/todo'
import Login from './components/login'

function App() {

  return (
      <Router>
      <div>
        <nav className='bg-stone-800'>
          <ul>
            <li>
              <Link to="/">Login</Link>
            </li>
            <li>
              <Link to="/todo">Todo</Link>
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
