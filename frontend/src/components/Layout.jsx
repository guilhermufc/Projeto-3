import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Post from './Post'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isAuthRoute = ['/login', '/register', '/'].includes(location.pathname) || (location.pathname === '/post' && isMobile)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname === '/post' && !isMobile) {
      setIsModalOpen(true)
    }
  }, [location.pathname, isMobile])

  if (isAuthRoute) {
    return children
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
    return `http://localhost:3000${imagePath}`
  }

  const currentPath = location.pathname

  return (
    <div className="w-full min-h-screen bg-[#F4F4F4]">
      <div className="min-h-screen md:grid md:grid-cols-[100px_1fr_100px] md:max-w-full md:px-2">
        {/* Coluna 1: Sidebar (esquerda) - apenas no desktop */}
        <aside className="hidden md:flex flex-col items-center py-6 border-r border-gray-200/50 h-screen sticky top-0 justify-center">
          <div className="bg-white border border-gray-100 rounded-[48px] py-8 px-3 flex flex-col gap-5 items-center shadow-xs w-20">
            
            {/* 1. Notificações */}
            <button
              onClick={() => alert('Sem novas notificações.')}
              className="w-10 h-10 bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
              title="Notificações"
            >
              <span className="fi fi-br-bell-ring text-[18px]" />
            </button>

            {/* 2. Pesquisa */}
            <button
              onClick={() => navigate('/search')}
              className={`flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                currentPath === '/search'
                  ? 'w-12 h-12 bg-black text-white shadow-lg scale-110'
                  : 'w-10 h-10 bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title="Buscar"
            >
              <span className={`fi fi-br-search ${currentPath === '/search' ? 'text-[20px]' : 'text-[18px]'}`} />
            </button>

            {/* 3. Home */}
            <button
              onClick={() => navigate('/feed')}
              className={`flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                currentPath === '/feed'
                  ? 'w-12 h-12 bg-black text-white shadow-lg scale-110'
                  : 'w-10 h-10 bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title="Página Inicial"
            >
              <span className={`fi fi-br-home ${currentPath === '/feed' ? 'text-[20px]' : 'text-[18px]'}`} />
            </button>

            {/* Escrever na Sidebar */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
              title="Escrever Publicação"
            >
              <span className="fi fi-br-plus text-[18px]" />
            </button>

            {/* 4. Calendário */}
            <button
              onClick={() => navigate('/calendar')}
              className={`flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                currentPath === '/calendar'
                  ? 'w-12 h-12 bg-black text-white shadow-lg scale-110'
                  : 'w-10 h-10 bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title="Calendário"
            >
              <span className={`fi fi-br-calendar ${currentPath === '/calendar' ? 'text-[20px]' : 'text-[18px]'}`} />
            </button>

            {/* 5. Perfil */}
            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center justify-center rounded-full transition-all duration-200 overflow-hidden cursor-pointer ${
                currentPath === '/profile' || currentPath === '/salvos'
                  ? 'w-12 h-12 border-4 border-black shadow-lg scale-110 bg-white'
                  : 'w-10 h-10 bg-gray-100 hover:bg-gray-200'
              }`}
              title="Meu Perfil"
            >
              {user?.avatar ? (
                <img
                  src={resolveImageUrl(user.avatar)}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="fi fi-br-circle-user text-[18px] text-gray-500" />
              )}
            </button>

            {/* Divider */}
            <div className="w-8 h-[1px] bg-gray-100 my-1" />

            {/* 6. Sair */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
              title="Sair"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>

          </div>
        </aside>

        {/* Coluna 2: Conteúdo Central */}
        <main className={`w-full min-h-screen bg-transparent mx-auto ${currentPath === '/calendar' ? 'max-w-5xl md:px-4' : 'max-w-2xl'}`}>
          {children}
        </main>

        {/* Coluna 3: Botão de Escrever (direita) - apenas no desktop */}
        <aside className="hidden md:flex flex-col justify-end items-center pb-12 border-l border-gray-200/50 h-screen sticky top-0">
          {currentPath === '/feed' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#ff9947] hover:bg-[#e68536] hover:scale-110 active:scale-95 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Criar Publicação"
            >
              <span className="fi fi-br-plus text-[28px]" />
            </button>
          )}
        </aside>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Post
            isModal={true}
            onClose={() => {
              setIsModalOpen(false)
              if (location.pathname === '/post') {
                navigate('/feed')
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
