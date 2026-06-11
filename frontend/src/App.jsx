import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Feed from './components/Feed'
import Post from './components/Post'
import Register from './components/Register'
import Profile from "./components/Profile";
import Search from './components/Search'
import OtherProfile from './components/OtherProfile'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/post" element={<Post />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile/:username" element={<OtherProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
