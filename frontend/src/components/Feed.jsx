import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post } from '../services/api'
import '../styles/Feed.css' // Importa estilos customizados do Feed (CSS vanilla)

// Mapeamento de estilos dinâmicos de categoria
const categoryStyles = {
  Métodos:     'bg-[#FFAB6D] text-white',
  Leitura:     'bg-[#FF85D1] text-white',
  Registro:    'bg-[#A3A1FF] text-white',
  Tutorial:    'bg-[#5BA3FF] text-white',
  Dica:        'bg-[#FF6B9D] text-white',
  Pergunta:    'bg-[#FFC75F] text-white',
  Resposta:    'bg-[#88D498] text-white',
  Artigo:      'bg-[#FF9E64] text-white',
  Vídeo:       'bg-[#7AA2F7] text-white',
  Experiência: 'bg-[#BB9AF7] text-white',
  Projeto:     'bg-[#7DCFFF] text-white',
  Recurso:     'bg-[#9ECE6A] text-white',
  Dúvida:      'bg-[#E0AF68] text-white',
  Discussão:   'bg-[#73DACA] text-white',
  Evento:      'bg-[#F7768E] text-white',
  Anúncio:     'bg-[#FF007F] text-white',
  'Caso de Uso': 'bg-[#00D9FF] text-white',
  Pesquisa:    'bg-[#B469D9] text-white',
  Ferramenta:  'bg-[#FFD700] text-white',
  Desafio:     'bg-[#FF4500] text-white',
}

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Converte URLs relativas das imagens de posts para apontar ao servidor
  const resolveImageUrl = (imagePath) => {
    if (!imagePath) {
      return ''
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }

    return `http://localhost:3000${imagePath}`
  }

  // Verifica a sessão ativa do usuário e dispara a busca de posts no banco
  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(storedUser))
    fetchPosts()
  }, [navigate])

  // Busca todos os posts da API
  const fetchPosts = async () => {
    try {
      const data = await get('/api/posts')
      setPosts(data || [])
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    } finally {
      setLoading(false) // Desliga carregamento
    }
  }

  // Permite salvar ou desmarcar salvamento de uma publicação (toggle)
  const handleToggleSave = async (postId) => {
    try {
      const data = await post(`/api/posts/${postId}/save`, {})

      const updatedPost = data?.post

      if (updatedPost) {
        // Atualiza o estado da lista local apenas modificando o post em questão
        setPosts((currentPosts) =>
          currentPosts.map((p) =>
            p.id === postId
              ? { ...p, saved_count: updatedPost.saved_count, is_saved: updatedPost.is_saved }
              : p,
          ),
        )
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    }
  }

  // Atalho para ir para a tela de criação de postagem
  const handleCreatePost = () => {
    navigate('/post')
  }

  return (
    <div className="feed-container">
      
      {/* Cabeçalho superior (Exibido apenas em dispositivos Mobile) */}
      <header className="feed-header">
        <div className="feed-header-left">
          <div className="feed-notification-wrapper">
            <div className="feed-notification-badge">
              <span className="fi fi-br-bell-ring" aria-hidden="true" />
            </div>
          </div>
        </div>
        
        {/* Avatar redireciona para a tela de perfil do usuário logado */}
        <div
          className="feed-avatar-wrapper"
          onClick={() => navigate('/profile')}
        >
          {user?.avatar ? (
            <img
              src={resolveImageUrl(user.avatar)}
              alt={user.username}
            />
          ) : (
            <span className="fi fi-br-circle-user" aria-hidden="true" />
          )}
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="feed-main">
        <div className="feed-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#6b7280' }}>Carregando posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#6b7280' }}>Nenhum post encontrado. Seja o primeiro a compartilhar!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="feed-post-card">
                
                {/* Crachás de Categorias */}
                {post.categories && post.categories.length > 0 && (
                  <div className="feed-post-badges">
                    {post.categories.map((cat) => (
                      <span
                        key={cat}
                        className={`feed-badge ${categoryStyles[cat] || 'bg-gray-200 text-gray-600'}`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cabeçalho com dados de autoria */}
                <div className="feed-post-header">
                  <div 
                    className="feed-post-author-box"
                    onClick={() => navigate(`/profile/${post.author}`)}
                  >
                    <div className="feed-post-avatar">
                      {post.authorAvatar ? (
                        <img
                          src={resolveImageUrl(post.authorAvatar)}
                          alt={post.author}
                        />
                      ) : (
                        <span className="fi fi-br-circle-user" aria-hidden="true" />
                      )}
                    </div>
                    
                    <div className="feed-post-author-info">
                      <h3 className="feed-post-author-name">{post.author}</h3>
                      {post.title && <p className="feed-post-title">{post.title}</p>}
                    </div>
                  </div>
                </div>

                {/* Conteúdo textual e imagem opcional da publicação */}
                <div className="feed-post-body">
                  <p className="feed-post-content">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="feed-post-image-wrapper">
                      <img alt="Post" src={resolveImageUrl(post.image)} />
                    </div>
                  )}
                </div>

                {/* Ações inferiores - Salvar Post */}
                <div className="feed-post-actions">
                  <button
                    type="button"
                    onClick={() => handleToggleSave(post.id)}
                    className="feed-save-btn"
                    aria-pressed={Boolean(post.is_saved)}
                    title={post.is_saved ? 'Remover salvo' : 'Salvar'}
                  >
                    {post.is_saved ? (
                      <img
                        src="/icons/bookmark_prenchido.png"
                        alt="Salvo"
                        style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(35%) saturate(1637%) hue-rotate(345deg) brightness(103%) contrast(101%)' }}
                      />
                    ) : (
                      <span className="fi fi-br-bookmark" aria-hidden="true" />
                    )}
                    <span className="feed-save-count">{post.saved_count || 0}</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Navegação inferior (Mobile apenas) */}
      <nav className="feed-mobile-nav">
        <div onClick={() => navigate('/search')} className="feed-nav-item">
          <span className="fi fi-br-search" aria-hidden="true" />
        </div>
        <div className="feed-nav-item-active">
          <span className="fi fi-br-home" aria-hidden="true" />
        </div>
        <div onClick={() => navigate('/calendar')} className="feed-nav-item">
          <span className="fi fi-br-calendar" aria-hidden="true" />
        </div>
      </nav>

      {/* Botão flutuante para criação de post (Mobile apenas) */}
      <button
        onClick={handleCreatePost}
        className="feed-fab-mobile"
        title="Criar Publicação"
      >
        <span className="fi fi-br-plus" aria-hidden="true" />
      </button>
    </div>
  )
}
