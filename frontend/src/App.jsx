import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Feed from './components/Feed'
import Post from './components/Post'
import Register from './components/Register'
import Profile from "./components/Profile"
import Search from './components/Search'
import OtherProfile from './components/OtherProfile'
import Salvos from './components/Salvos'
import Layout from './components/Layout'
import Calendar from './components/Calendar'
import './App.css' // Importação de estilos globais/shell da aplicação

// Componente raiz do aplicativo. Define as rotas usando o React Router.
function App() {
  return (
    <Router>
      {/* O componente Layout envolve todas as rotas e renderiza a barra lateral (sidebar) */}
      <Layout>
        <Routes>
          {/* Rotas públicas de autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas acessíveis aos usuários conectados */}
          <Route path="/feed" element={<Feed />} />
          <Route path="/post" element={<Post />} />
          <Route path="/search" element={<Search />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/profile/:username" element={<OtherProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/salvos" element={<Salvos />} />

          {/* Redireciona qualquer rota desconhecida ou raiz "/" para o login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
