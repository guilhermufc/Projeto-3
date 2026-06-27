import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post } from '../services/api'
import '../styles/Salvos.css' // Importa estilos customizados da tela (CSS vanilla)

// Mapeamento de cores estáticas de categorias
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

export default function Salvos() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Converte caminhos locais de imagens para o servidor de desenvolvimento
  const resolveImageUrl = (imagePath) => {
    if (!imagePath) {
      return ''
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }

    return `http://localhost:3000${imagePath}`
  }

  // Verifica a autenticação e busca os posts marcados
  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      navigate('/login')
      return
    }

    fetchSavedPosts()
  }, [navigate])

  // Busca posts favoritados/salvos
  const fetchSavedPosts = async () => {
    try {
      const data = await get('/api/posts/saved')
      setPosts(data || [])
    } catch (error) {
      console.error('Erro ao buscar posts salvos:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Alterna a marcação de post. Remove o post da tela imediatamente já que estamos visualizando apenas os itens salvos.
  const handleToggleSave = async (postId) => {
    try {
      await post(`/api/posts/${postId}/save`, {})

      // Filtra localmente removendo o post desmarcado
      setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postId))
    } catch (error) {
      console.error('Erro ao remover post salvo:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    }
  }

  return (
    <div className="salvos-container">
      
      {/* Cabeçalho */}
      <header className="salvos-header">
        <button
          onClick={() => navigate('/profile')}
          className="salvos-back-btn"
          title="Voltar ao Perfil"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <div className="salvos-title-wrapper">
          <h1>Salvos</h1>
        </div>
      </header>

      {/* Grid de listagem central */}
      <main className="salvos-main">
        <div className="salvos-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#6b7280' }}>Carregando posts salvos...</p>
            </div>
          ) : posts.length === 0 ? (
            
            /* Estado vazio */
            <div className="salvos-empty-state">
              <span className="material-symbols-outlined salvos-empty-icon">
                bookmark_border
              </span>
              <p className="salvos-empty-text">Nenhum post salvo ainda.</p>
              <button
                onClick={() => navigate('/feed')}
                className="salvos-explore-btn"
              >
                Explorar Feed
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="salvos-post-card">
                
                {/* Categorias */}
                {post.categories && post.categories.length > 0 && (
                  <div className="salvos-post-badges">
                    {post.categories.map((cat) => (
                      <span
                        key={cat}
                        className={`salvos-badge ${categoryStyles[cat] || 'bg-gray-200 text-gray-600'}`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Autor */}
                <div className="salvos-post-header">
                  <div 
                    className="salvos-post-author-box"
                    onClick={() => navigate(`/profile/${post.author}`)}
                  >
                    <div className="salvos-post-avatar">
                      {post.authorAvatar ? (
                        <img
                          src={resolveImageUrl(post.authorAvatar)}
                          alt={post.author}
                        />
                      ) : (
                        <span className="fi fi-br-circle-user" aria-hidden="true" />
                      )}
                    </div>
                    <div className="salvos-post-author-info">
                      <h3 className="salvos-post-author-name">{post.author}</h3>
                      {post.title && <p className="salvos-post-title">{post.title}</p>}
                    </div>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="salvos-post-body">
                  <p className="salvos-post-content">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="salvos-post-image-wrapper">
                      <img alt="Post" src={resolveImageUrl(post.image)} />
                    </div>
                  )}
                </div>

                {/* Ações: Desmarcar/Remover dos Salvos */}
                <div className="salvos-post-actions">
                  <button
                    type="button"
                    onClick={() => handleToggleSave(post.id)}
                    className="salvos-save-btn"
                    aria-pressed={true}
                    title="Remover salvo"
                  >
                    <img
                      src="/icons/bookmark_prenchido.png"
                      alt="Salvo"
                      style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(35%) saturate(1637%) hue-rotate(345deg) brightness(103%) contrast(101%)' }}
                    />
                    <span className="salvos-save-count">{post.saved_count || 0}</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
