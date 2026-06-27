import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Post from './Post'
import '../styles/Layout.css' // Importa estilos customizados do layout geral (CSS vanilla)

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Estado para guardar os dados do usuário conectado
  const [user, setUser] = useState(null)
  // Estado para controlar a exibição do modal de novo post
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Estado responsivo para saber se o dispositivo possui tela menor que 768px (Mobile)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Monitora alterações de tamanho da janela do navegador para atualizar o estado responsivo
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Verifica se o usuário está nas telas de login/registro para ocultar o layout/sidebar
  const isAuthRoute = ['/login', '/register', '/'].includes(location.pathname) || (location.pathname === '/post' && isMobile)

  // Lê os dados salvos do usuário localmente toda vez que navega
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [location.pathname])

  // No desktop, a rota /post é renderizada diretamente como um modal sobreposto ao invés de ir para outra página
  useEffect(() => {
    if (location.pathname === '/post' && !isMobile) {
      setIsModalOpen(true)
    }
  }, [location.pathname, isMobile])

  // Se o usuário estiver numa rota de login/registro, renderiza apenas o componente filho diretamente
  if (isAuthRoute) {
    return children
  }

  // Função para deslogar da aplicação, limpando dados da sessão e redirecionando
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Converte a URL da imagem de perfil do usuário para o servidor local
  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
    return `http://localhost:3000${imagePath}`
  }

  const currentPath = location.pathname

  return (
    <div className="layout-container">
      <div className="layout-grid">
        
        {/* Coluna 1: Sidebar (esquerda) - Visível apenas em computadores/telas maiores */}
        <aside className="layout-sidebar-left">
          <div className="layout-sidebar-menu">
            
            {/* 1. Botão de Notificações */}
            <button
              onClick={() => alert('Sem novas notificações.')}
              className="layout-menu-btn"
              title="Notificações"
            >
              <span className="fi fi-br-bell-ring text-[18px]" />
            </button>

            {/* 2. Botão de Pesquisa (marca ativo se a rota for /search) */}
            <button
              onClick={() => navigate('/search')}
              className={currentPath === '/search' ? 'layout-menu-btn-active' : 'layout-menu-btn'}
              title="Buscar"
            >
              <span className="fi fi-br-search" />
            </button>

            {/* 3. Botão Home/Feed (marca ativo se a rota for /feed) */}
            <button
              onClick={() => navigate('/feed')}
              className={currentPath === '/feed' ? 'layout-menu-btn-active' : 'layout-menu-btn'}
              title="Página Inicial"
            >
              <span className="fi fi-br-home" />
            </button>

            {/* Botão de Atalho para abrir o modal de nova publicação */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="layout-menu-btn"
              title="Escrever Publicação"
            >
              <span className="fi fi-br-plus" />
            </button>

            {/* 4. Botão de Calendário */}
            <button
              onClick={() => navigate('/calendar')}
              className={currentPath === '/calendar' ? 'layout-menu-btn-active' : 'layout-menu-btn'}
              title="Calendário"
            >
              <span className="fi fi-br-calendar" />
            </button>

            {/* 5. Botão de Perfil */}
            <button
              onClick={() => navigate('/profile')}
              className={currentPath === '/profile' || currentPath === '/salvos' ? 'layout-avatar-btn-active' : 'layout-avatar-btn'}
              title="Meu Perfil"
            >
              {user?.avatar ? (
                <img
                  src={resolveImageUrl(user.avatar)}
                  alt={user.username}
                />
              ) : (
                <span className="fi fi-br-circle-user text-[18px]" />
              )}
            </button>

            {/* Divisor visual */}
            <div className="layout-menu-divider" />

            {/* 6. Botão Sair */}
            <button
              onClick={handleLogout}
              className="layout-logout-btn"
              title="Sair"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>

          </div>
        </aside>

        {/* Coluna 2: Conteúdo Central da Aplicação */}
        <main className={`layout-main-content ${currentPath === '/calendar' ? 'layout-width-calendar' : 'layout-width-default'}`}>
          {children}
        </main>

        {/* Coluna 3: Barra lateral direita (somente no desktop) */}
        <aside className="layout-sidebar-right">
          {/* Se estiver no feed, exibe botão grande flutuante para novas publicações */}
          {currentPath === '/feed' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="layout-post-fab"
              title="Criar Publicação"
            >
              <span className="fi fi-br-plus text-[28px]" />
            </button>
          )}
        </aside>
      </div>

      {/* Renderiza o modal de criação de post sobreposto na tela caso o estado esteja ativo */}
      {isModalOpen && (
        <div className="layout-modal-overlay">
          <Post
            isModal={true}
            onClose={() => {
              setIsModalOpen(false)
              // Se o usuário acessou a rota de post diretamente, volta para o feed ao fechar
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
