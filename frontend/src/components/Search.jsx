import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post } from '../services/api'
import '../styles/Search.css' // Importa estilos customizados da busca (CSS vanilla)

// Cores e estilos estáticos das categorias para tags
const CATEGORIES = [
  { label: 'Métodos',     color: 'bg-[#FFAB6D] text-white' },
  { label: 'Leitura',     color: 'bg-[#FF85D1] text-white' },
  { label: 'Registro',    color: 'bg-[#A3A1FF] text-white' },
  { label: 'Tutorial',    color: 'bg-[#5BA3FF] text-white' },
  { label: 'Dica',        color: 'bg-[#FF6B9D] text-white' },
  { label: 'Pergunta',    color: 'bg-[#FFC75F] text-white' },
  { label: 'Resposta',    color: 'bg-[#88D498] text-white' },
  { label: 'Artigo',      color: 'bg-[#FF9E64] text-white' },
  { label: 'Vídeo',       color: 'bg-[#7AA2F7] text-white' },
  { label: 'Experiência', color: 'bg-[#BB9AF7] text-white' },
  { label: 'Projeto',     color: 'bg-[#7DCFFF] text-white' },
  { label: 'Recurso',     color: 'bg-[#9ECE6A] text-white' },
  { label: 'Dúvida',      color: 'bg-[#E0AF68] text-white' },
  { label: 'Discussão',   color: 'bg-[#73DACA] text-white' },
  { label: 'Evento',      color: 'bg-[#F7768E] text-white' },
  { label: 'Anúncio',     color: 'bg-[#FF007F] text-white' },
  { label: 'Caso de Uso', color: 'bg-[#00D9FF] text-white' },
  { label: 'Pesquisa',    color: 'bg-[#B469D9] text-white' },
  { label: 'Ferramenta',  color: 'bg-[#FFD700] text-white' },
  { label: 'Desafio',     color: 'bg-[#FF4500] text-white' },
]

const categoryStyles = Object.fromEntries(CATEGORIES.map((c) => [c.label, c.color]))

// Cores dinâmicas para avatares na pesquisa
const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#3b82f6' }, // Blue
  { bg: '#fce7f3', text: '#ec4899' }, // Pink
  { bg: '#f3e8ff', text: '#a855f7' }, // Purple
  { bg: '#dcfce7', text: '#22c55e' }, // Green
]

function getAvatarColorStyle(index) {
  const item = AVATAR_COLORS[index % AVATAR_COLORS.length]
  return {
    backgroundColor: item.bg,
    color: item.text,
  }
}

function resolveImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
  return `http://localhost:3000${imagePath}`
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [userResults, setUserResults] = useState([])
  const [history, setHistory] = useState([])
  const [userLoading, setUserLoading] = useState(false)
  const [user, setUser] = useState(null)

  const [activeCategory, setActiveCategory] = useState(null)
  const [categoryPosts, setCategoryPosts] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(false)

  const [isFocused, setIsFocused] = useState(false)
  const navigate = useNavigate()
  const searchTimerRef = useRef(null)
  const inputRef = useRef(null)

  // Autenticação e histórico salvo localmente
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(storedUser))
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
  }, [navigate])

  // Efeito de debounce na caixa de pesquisa para otimizar acessos à API
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!query.trim()) { setUserResults([]); return }
    searchTimerRef.current = setTimeout(() => searchUsers(query), 300)
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [query])

  // Pesquisa usuários
  const searchUsers = async (searchQuery) => {
    setUserLoading(true)
    try {
      const data = await get('/api/users/search', {
        params: { q: searchQuery },
      })
      setUserResults(data || [])
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    } finally {
      setUserLoading(false)
    }
  }

  // Filtra publicações da categoria clicada
  const fetchPostsByCategory = async (category) => {
    setCategoryLoading(true)
    setCategoryPosts([])
    try {
      const data = await get('/api/posts', {
        params: { category },
      })
      setCategoryPosts(data || [])
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    } finally {
      setCategoryLoading(false)
    }
  }

  // Alterna o salvamento do post da categoria selecionada
  const handleToggleSave = async (postId) => {
    try {
      const data = await post(`/api/posts/${postId}/save`, {})
      const updatedPost = data?.post
      if (updatedPost) {
        setCategoryPosts((current) =>
          current.map((p) =>
            p.id === postId
              ? { ...p, saved_count: updatedPost.saved_count, is_saved: updatedPost.is_saved }
              : p,
          ),
        )
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    }
  }

  // Ação ao selecionar categoria
  const handleCategoryClick = (label) => {
    if (activeCategory === label) {
      setActiveCategory(null)
      setCategoryPosts([])
    } else {
      setActiveCategory(label)
      setQuery('')
      setUserResults([])
      fetchPostsByCategory(label)
    }
  }

  // Adiciona ao histórico do navegador
  const addToHistory = (clickedUser) => {
    const updated = [clickedUser, ...history.filter((h) => h.id !== clickedUser.id)].slice(0, 10)
    setHistory(updated)
    localStorage.setItem('searchHistory', JSON.stringify(updated))
  }

  // Remove individualmente do histórico
  const removeFromHistory = (userId) => {
    const updated = history.filter((h) => h.id !== userId)
    setHistory(updated)
    localStorage.setItem('searchHistory', JSON.stringify(updated))
  }

  // Limpa todo o histórico
  const clearAllHistory = () => {
    setHistory([])
    localStorage.removeItem('searchHistory')
  }

  // Clique em usuário
  const handleUserClick = (clickedUser) => {
    addToHistory(clickedUser)
    setQuery('')
    setUserResults([])
    navigate(`/profile/${clickedUser.username}`)
  }

  const isSearchingUsers = query.trim().length > 0
  const isShowingCategory = !!activeCategory && !isSearchingUsers
  const displayUsers = isSearchingUsers ? userResults : history

  return (
    <div className="search-container">
      
      {/* Cabeçalho superior da Busca */}
      <header className="search-header">
        
        {/* Linha superior com foto e notificações (Mobile apenas) */}
        <div className="search-header-nav">
          <button className="search-notification-btn" onClick={() => alert('Sem novas notificações.')}>
            <span className="fi fi-br-bell-ring" aria-hidden="true" />
          </button>
          
          <button
            className="search-avatar-btn"
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
          </button>
        </div>

        {/* Caixa de Texto da Busca */}
        <div
          className={`search-bar-row ${isFocused ? 'search-bar-focused' : ''}`}
        >
          <span className="fi fi-br-search search-bar-icon-search" aria-hidden="true" />
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Buscar perfis de usuários..."
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (e.target.value.trim()) {
                setActiveCategory(null)
                setCategoryPosts([])
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setUserResults([]); inputRef.current?.focus() }}
              className="search-clear-btn"
              title="Limpar termo"
            >
              <span className="fi fi-br-cross-small" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {/* Chips de Categorias */}
      <section className="search-categories-section">
        <div className="search-categories-title-row">
          <img src="/icons/categorias.png" alt="Categorias" />
          <span className="search-categories-title">Categorias</span>
        </div>
        
        <div className="search-categories-list no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat.label)}
              className={`search-category-chip ${cat.color} ${activeCategory === cat.label ? 'search-category-chip-active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Conteúdo principal */}
      <section className="search-content-section">

        {/* Categoria Selecionada */}
        {isShowingCategory && (
          <>
            <div className="search-list-header">
              <div className="search-list-title-box">
                <span className={`search-badge ${categoryStyles[activeCategory]}`}>
                  {activeCategory}
                </span>
                <h2 className="search-list-title">Publicações</h2>
              </div>
              {categoryLoading && (
                <div className="search-spinner" />
              )}
            </div>

            {!categoryLoading && categoryPosts.length === 0 && (
              <div className="search-empty-state">
                <div className="search-empty-icon-box">
                  <span className="fi fi-br-document" aria-hidden="true" />
                </div>
                <p className="search-empty-text">
                  Nenhuma publicação em <strong>"{activeCategory}"</strong> ainda.
                </p>
              </div>
            )}

            <div className="search-posts-list">
              {categoryPosts.map((post) => (
                <article key={post.id} className="search-post-card">
                  <div className="search-post-badge-pos">
                    <span className={`search-badge ${categoryStyles[activeCategory]}`}>
                      {activeCategory}
                    </span>
                  </div>

                  {/* Detalhes do Autor */}
                  <div className="search-post-header">
                    <div
                      className="search-post-author-box"
                      onClick={() => navigate(`/profile/${post.author}`)}
                    >
                      <div className="search-post-avatar-circle">
                        {post.authorAvatar ? (
                          <img
                            src={resolveImageUrl(post.authorAvatar)}
                            alt={post.author}
                          />
                        ) : (
                          <span className="fi fi-br-circle-user" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <p className="search-post-author-name">{post.author}</p>
                        {post.title && (
                          <p className="search-post-title">{post.title}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo da publicação */}
                  <p className="search-post-content">{post.content}</p>

                  {post.image && (
                    <div className="search-post-img-wrapper">
                      <img
                        alt="Post"
                        src={resolveImageUrl(post.image)}
                      />
                    </div>
                  )}

                  {/* Ação de salvar */}
                  <div className="search-post-actions">
                    <button
                      type="button"
                      onClick={() => handleToggleSave(post.id)}
                      className="search-save-btn"
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
                      <span className="search-save-count">{post.saved_count || 0}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Histórico ou Resultados de Pesquisa de Usuários */}
        {!isShowingCategory && (
          <>
            {/* Título da seção (Resultados ou Histórico) */}
            {!isSearchingUsers && history.length > 0 && (
              <div className="search-list-header">
                <h2 className="search-list-title">Histórico</h2>
                <button
                  onClick={clearAllHistory}
                  className="search-history-clear-btn"
                  title="Limpar histórico"
                >
                  <span className="fi fi-br-trash" aria-hidden="true" />
                </button>
              </div>
            )}

            {isSearchingUsers && (
              <div className="search-list-header">
                <h2 className="search-list-title">Resultados</h2>
                {userLoading && (
                  <div className="search-spinner" />
                )}
              </div>
            )}

            {/* Estados vazios */}
            {displayUsers.length === 0 && isSearchingUsers && !userLoading && (
              <div className="search-empty-state">
                <div className="search-empty-icon-box">
                  <span className="fi fi-br-search" aria-hidden="true" />
                </div>
                <p className="search-empty-text">
                  Nenhum usuário encontrado para <strong>"{query}"</strong>
                </p>
              </div>
            )}

            {displayUsers.length === 0 && !isSearchingUsers && history.length === 0 && (
              <div className="search-empty-state">
                <div className="search-empty-icon-box">
                  <span className="fi fi-br-search" aria-hidden="true" />
                </div>
                <p className="search-empty-text">
                  Pesquise por perfis ou selecione uma categoria
                </p>
              </div>
            )}

            {/* Listagem de Usuários */}
            <div className="search-users-list">
              {displayUsers.map((item, index) => {
                const avatarStyle = getAvatarColorStyle(index)
                return (
                  <div
                    key={item.id}
                    className="search-user-card"
                    onClick={() => handleUserClick(item)}
                  >
                    <div className="search-user-left">
                      <div className="search-user-avatar" style={avatarStyle}>
                        {item.avatar ? (
                          <img
                            src={resolveImageUrl(item.avatar)}
                            alt={item.username}
                          />
                        ) : (
                          <span className="fi fi-br-circle-user" aria-hidden="true" />
                        )}
                      </div>
                      <div className="search-user-info">
                        <span className="search-user-name">{item.username}</span>
                        {item.email && (
                          <span className="search-user-email">{item.email}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Botão para deletar do histórico */}
                    {!isSearchingUsers && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromHistory(item.id) }}
                        className="search-delete-history-btn"
                        title="Remover"
                      >
                        <span className="fi fi-br-cross-small" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* Navegação inferior (Mobile apenas) */}
      <nav className="search-mobile-nav">
        <div className="search-nav-item-active">
          <span className="fi fi-br-search" aria-hidden="true" />
        </div>
        <div
          onClick={() => navigate('/feed')}
          className="search-nav-item"
        >
          <span className="fi fi-br-home" aria-hidden="true" />
        </div>
        <div onClick={() => navigate('/calendar')} className="search-nav-item">
          <span className="fi fi-br-calendar" aria-hidden="true" />
        </div>
      </nav>
    </div>
  )
}
