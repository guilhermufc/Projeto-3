import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post } from '../services/api'
import '../styles/Salvos.css' // Importa estilos customizados da tela (CSS vanilla)

// 🔹 Mapeamento de cores estáticas de categorias
// Cada chave é uma categoria e o valor define a cor do badge
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
  // 🔹 Hooks e Estado
  // posts guarda os posts salvos que vêm da API
  // loading controla se a tela está carregando ou não
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Hook do React Router para mudar de página
  const navigate = useNavigate()

  // 🔹 Função auxiliar para resolver URL de imagens
  // Se for link externo, retorna direto; se for caminho local, adiciona localhost
  const resolveImageUrl = (imagePath) => {
    if (!imagePath) {
      return ''
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }

    return `http://localhost:3000${imagePath}`
  }

  // 🔹 useEffect
  // Esse trecho roda quando o componente é montado.
  // Ele verifica se existe usuário no localStorage.
  // Se não tiver, redireciona para login. Se tiver, chama a função que busca os posts salvos.
  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      navigate('/login')
      return
    }

    fetchSavedPosts()
  }, [navigate])

  // 🔹 Função de buscar posts
  // Faz uma requisição para a API /api/posts/saved.
  // Se der certo, atualiza o estado posts.
  // Se der erro 401, significa que o token expirou e o usuário é mandado para login.
  // No final, marca loading como falso.
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

  // 🔹 Função de remover dos salvos
  // Essa função chama a API para alternar o status de salvo.
  // Como estamos na tela de salvos, se o usuário desmarcar, o post é removido imediatamente da lista local.
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
      
      {/* 🔹 Botão de voltar
          Esse botão usa o navigate do React Router para voltar para a página de perfil */}
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

      {/* 🔹 Renderização condicional
          Decide o que mostrar na tela: carregando, vazio ou lista de posts */}
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
                
                {/* 🔹 Categorias com cores
                    Esse trecho mostra as categorias do post como badges coloridas.
                    As cores vêm do objeto categoryStyles definido no início do arquivo. */}
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

                {/* 🔹 Autor do post */}
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

                {/* 🔹 Conteúdo e imagem */}
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

                {/* 🔹 Botão para remover dos salvos */}
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
