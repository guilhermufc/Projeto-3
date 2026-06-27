import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get, post } from '../services/api'
import '../styles/OtherProfile.css' // Importa estilos customizados da tela (CSS vanilla)

// Mapeamento de cores de categorias herdado do Tailwind para regras de estilo do CSS
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

export default function OtherProfile() {
  const { username } = useParams() // Pega o nome do usuário cujos detalhes serão buscados via rota URL
  const navigate = useNavigate()
  const [profileUser, setProfileUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Resolução da URL da imagem
  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    return `http://localhost:3000${imagePath}`
  }

  // Monitora alterações do username no link para atualizar as informações carregadas
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }

    fetchProfileAndPosts()
  }, [username, navigate])

  // Função assíncrona para buscar perfil e posts do usuário simultaneamente
  const fetchProfileAndPosts = async () => {
    try {
      // Faz requisições paralelas para ganhar performance
      const [userData, postsData] = await Promise.all([
        get(`/api/users/${username}`),
        get(`/api/posts`, { params: { author: username } }),
      ])

      setProfileUser(userData)
      setPosts(postsData || [])
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    } finally {
      setLoading(false) // Finaliza o esqueleto de carregamento
    }
  }

  // Executa a marcação/favoritar do post selecionado
  const handleToggleSave = async (postId) => {
    try {
      const data = await post(`/api/posts/${postId}/save`, {})

      const updatedPost = data?.post

      if (updatedPost) {
        // Atualiza dinamicamente a contagem e estado visual sem recarregar a lista toda
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
    }
  }

  // Exibe tela de carregamento caso os dados estejam sendo buscados
  if (loading) {
    return (
      <div className="other-profile-loading">
        <p>Carregando perfil...</p>
      </div>
    )
  }

  // Exibe tela de erro caso o username não exista no banco
  if (!profileUser) {
    return (
      <div className="other-profile-error">
        <p>Usuário não encontrado.</p>
        <button
          onClick={() => navigate(-1)}
          className="other-profile-error-btn"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="other-profile-container">
      
      {/* Cabeçalho do perfil público */}
      <header className="other-profile-header">
        <div className="other-profile-header-row">
          
          {/* Card com dados públicos de identificação */}
          <div className="other-profile-user-card">
            <div className="other-profile-avatar-circle">
              {profileUser.avatar ? (
                <img
                  src={resolveImageUrl(profileUser.avatar)}
                  alt={profileUser.username}
                />
              ) : (
                <span className="fi fi-br-circle-user text-[36px]" aria-hidden="true" />
              )}
            </div>
            
            <div className="other-profile-user-info">
              <h1>{profileUser.username}</h1>
              <p>
                {posts.length} {posts.length === 1 ? 'Publicação' : 'Publicações'}
              </p>
            </div>
          </div>

          {/* Botão de Fechar / Retornar à tela anterior */}
          <button
            onClick={() => navigate(-1)}
            aria-label="Fechar"
            className="other-profile-back-btn"
          >
            <span className="fi fi-br-cross" aria-hidden="true" />
          </button>
        </div>
      </header>
      
      {/* Biografia pública do usuário (se cadastrada) */}
      {profileUser.bio && (
        <div className="other-profile-bio-row">
          <div className="other-profile-bio-box">
            <span className="other-profile-bio-text">{profileUser.bio}</span>
          </div>
        </div>
      )}

      {/* Conteúdo principal - Publicações do usuário visualizado */}
      <main className="other-profile-main">
        <h2>Publicações</h2>

        <section className="other-profile-feed">
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#6b7280', fontWeight: '500' }}>Nenhum post publicado ainda.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="other-profile-post">
                
                {/* Categorias fixadas no topo direito do card */}
                {post.categories && post.categories.length > 0 && (
                  <div className="other-profile-post-badges">
                    {post.categories.map((cat) => (
                      <span
                        key={cat}
                        className={`other-profile-badge ${categoryStyles[cat] || 'bg-gray-200 text-gray-600'}`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dados da autoria do post */}
                <div className="other-profile-post-header">
                  <div
                    className="other-profile-post-author-box"
                    onClick={() => navigate(`/profile/${post.author}`)}
                  >
                    <div className="other-profile-post-avatar">
                      {post.authorAvatar ? (
                        <img
                          src={resolveImageUrl(post.authorAvatar)}
                          alt={post.author}
                        />
                      ) : (
                        <span className="fi fi-br-circle-user text-[28px]" aria-hidden="true" />
                      )}
                    </div>
                    <div className="other-profile-post-author-info">
                      <h3 className="other-profile-post-author-name">{post.author}</h3>
                      {post.title && <p className="other-profile-post-title">{post.title}</p>}
                    </div>
                  </div>
                </div>

                {/* Conteúdo escrito e imagem do post */}
                <div className="other-profile-post-body">
                  <p className="other-profile-post-content">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="other-profile-post-img-wrapper">
                      <img alt="Post" src={resolveImageUrl(post.image)} />
                    </div>
                  )}
                </div>

                {/* Ações inferiores: Toggle Salvar Post */}
                <div className="other-profile-post-actions">
                  <button
                    type="button"
                    onClick={() => handleToggleSave(post.id)}
                    className="other-profile-save-btn"
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
                    <span className="other-profile-save-count">{post.saved_count || 0}</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      {/* Menu inferior no Celular */}
      <nav className="other-profile-mobile-nav">
        <div onClick={() => navigate('/search')} className="other-profile-nav-item">
          <span className="fi fi-br-search" aria-hidden="true" />
        </div>
        <div onClick={() => navigate('/feed')} className="other-profile-nav-item-active">
          <span className="fi fi-br-home" aria-hidden="true" />
        </div>
        <div onClick={() => navigate('/calendar')} className="other-profile-nav-item">
          <span className="fi fi-br-calendar" aria-hidden="true" />
        </div>
      </nav>
    </div>
  )
}
