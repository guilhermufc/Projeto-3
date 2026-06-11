import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

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

const AVATAR_COLORS = [
  { bg: 'bg-blue-100', text: 'opacity-60' },
  { bg: 'bg-pink-100', text: 'opacity-60' },
  { bg: 'bg-purple-100', text: 'opacity-60' },
  { bg: 'bg-green-100', text: 'opacity-60' },
]

function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
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

  const [activeCategory, setActiveCategory] = useState(null)
  const [categoryPosts, setCategoryPosts] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(false)

  const [isFocused, setIsFocused] = useState(false)
  const navigate = useNavigate()
  const searchTimerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
  }, [navigate])

  // Debounced user search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!query.trim()) { setUserResults([]); return }
    searchTimerRef.current = setTimeout(() => searchUsers(query), 300)
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [query])

  const searchUsers = async (searchQuery) => {
    setUserLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/users/search', {
        params: { q: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserResults(response.data || [])
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

  const fetchPostsByCategory = async (category) => {
    setCategoryLoading(true)
    setCategoryPosts([])
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/posts', {
        params: { category },
        headers: { Authorization: `Bearer ${token}` },
      })
      setCategoryPosts(response.data || [])
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

  const handleToggleSave = async (postId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`http://localhost:3000/api/posts/${postId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const updatedPost = response.data?.post
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

  const handleCategoryClick = (label) => {
    if (activeCategory === label) {
      // Deselect
      setActiveCategory(null)
      setCategoryPosts([])
    } else {
      setActiveCategory(label)
      setQuery('')
      setUserResults([])
      fetchPostsByCategory(label)
    }
  }

  const addToHistory = (user) => {
    const updated = [user, ...history.filter((h) => h.id !== user.id)].slice(0, 10)
    setHistory(updated)
    localStorage.setItem('searchHistory', JSON.stringify(updated))
  }

  const removeFromHistory = (userId) => {
    const updated = history.filter((h) => h.id !== userId)
    setHistory(updated)
    localStorage.setItem('searchHistory', JSON.stringify(updated))
  }

  const clearAllHistory = () => {
    setHistory([])
    localStorage.removeItem('searchHistory')
  }

  const handleUserClick = (user) => {
    addToHistory(user)
    setQuery('')
    setUserResults([])
    navigate(`/profile/${user.username}`)
  }

  const isSearchingUsers = query.trim().length > 0
  const isShowingCategory = !!activeCategory && !isSearchingUsers

  // What to show in the user list section
  const displayUsers = isSearchingUsers ? userResults : history

  return (
    <div className="font-sans text-gray-900 pb-32 min-h-screen">
      {/* Top App Bar – Search */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4">
        <div
          className={`flex items-center gap-3 bg-white rounded-full border px-5 py-3.5 card-shadow transition-all duration-200 ${
            isFocused ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-100'
          }`}
        >
          <span className="fi fi-br-search text-[18px] opacity-40" aria-hidden="true" />
          <input
            ref={inputRef}
            className="bg-transparent border-none outline-none w-full text-[16px] leading-6 text-gray-900 placeholder:text-gray-400 focus:ring-0"
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
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <span className="fi fi-br-cross-small text-[14px] opacity-40" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {/* Filter Chips – Category Buttons */}
      <section className="px-6 pt-4 pb-1">
        <div className="flex items-center gap-2 mb-3 opacity-50">
          <img src="/icons/categorias.png" alt="Categorias" className="w-7 h-7" />
          <span className="font-bold text-[17px] text-gray-900">Categorias</span>
        </div>
        <div className="overflow-x-auto no-scrollbar flex gap-2 pb-1 py-2 px-1 -mx-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat.label)}
              className={`px-5 py-2.5 rounded-full text-[13px] leading-4 font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                activeCategory === cat.label
                  ? `${cat.color} ring-2 ring-offset-1 ring-gray-300 shadow-md scale-105`
                  : `${cat.color} opacity-60 hover:opacity-100`
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content Section */}
      <section className="flex-1 px-6 py-4">

        {/* ── CATEGORY POSTS ── */}
        {isShowingCategory && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${categoryStyles[activeCategory]}`}>
                  {activeCategory}
                </span>
                <h2 className="text-xl font-bold text-gray-900">Publicações</h2>
              </div>
              {categoryLoading && (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              )}
            </div>

            {!categoryLoading && categoryPosts.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="fi fi-br-document text-[32px] opacity-20" aria-hidden="true" />
                </div>
                <p className="text-gray-400 text-[15px]">
                  Nenhuma publicação em <span className="font-bold">"{activeCategory}"</span> ainda
                </p>
              </div>
            )}

            <div className="space-y-4">
              {categoryPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-[28px] p-5 card-shadow relative">
                  {/* Category badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${categoryStyles[activeCategory]}`}>
                      {activeCategory}
                    </span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 mb-3 pr-24">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/profile/${post.author}`)}
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {post.authorAvatar ? (
                          <img
                            src={resolveImageUrl(post.authorAvatar)}
                            alt={post.author}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="fi fi-br-circle-user text-[22px] opacity-40" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{post.author}</p>
                        {post.title && (
                          <p className="text-[17px] font-extrabold leading-tight text-gray-900">{post.title}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-[15px] leading-relaxed text-gray-700 mb-3">{post.content}</p>

                  {/* Image */}
                  {post.image && (
                    <div className="rounded-[20px] overflow-hidden bg-gray-100 mb-3">
                      <img
                        alt="Post"
                        className="w-full h-auto object-contain"
                        src={resolveImageUrl(post.image)}
                      />
                    </div>
                  )}

                  {/* Save button */}
                  <div className="flex items-center justify-start">
                    <button
                      type="button"
                      onClick={() => handleToggleSave(post.id)}
                      className="flex items-center gap-2 rounded-full transition-colors"
                      aria-pressed={Boolean(post.is_saved)}
                      title={post.is_saved ? 'Remover salvo' : 'Salvar'}
                    >
                       {post.is_saved ? (
                        <img
                          src="/icons/bookmark_prenchido.png"
                          alt="Salvo"
                          className="w-5 h-5"
                          style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(35%) saturate(1637%) hue-rotate(345deg) brightness(103%) contrast(101%)' }}
                        />
                      ) : (
                        <span className="fi fi-br-bookmark text-[20px] text-gray-400 opacity-60" aria-hidden="true" />
                      )}
                      <span className="text-sm text-gray-600">{post.saved_count || 0}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* ── USER SEARCH / HISTORY ── */}
        {!isShowingCategory && (
          <>
            {/* Section Header */}
            {!isSearchingUsers && history.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-on-surface">Histórico</h2>
                <button
                  onClick={clearAllHistory}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  title="Limpar histórico"
                >
                  <span className="fi fi-br-trash text-[18px] opacity-40" aria-hidden="true" />
                </button>
              </div>
            )}

            {isSearchingUsers && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-on-surface">Resultados</h2>
                {userLoading && (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                )}
              </div>
            )}

            {/* Empty states */}
            {displayUsers.length === 0 && isSearchingUsers && !userLoading && (
              <div className="text-center py-12 space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="fi fi-br-search text-[28px] opacity-30" aria-hidden="true" />
                </div>
                <p className="text-gray-400 text-[15px]">
                  Nenhum usuário encontrado para "<span className="font-bold">{query}</span>"
                </p>
              </div>
            )}

            {displayUsers.length === 0 && !isSearchingUsers && history.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="fi fi-br-search text-[32px] opacity-20" aria-hidden="true" />
                </div>
                <p className="text-gray-400 text-[15px]">
                  Pesquise por perfis ou selecione uma categoria
                </p>
              </div>
            )}

            {/* User list */}
            <div className="space-y-2">
              {displayUsers.map((user, index) => {
                const avatar = getAvatarColor(index)
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between group bg-white rounded-[24px] px-5 py-4 card-shadow cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${avatar.bg}`}>
                        {user.avatar ? (
                          <img
                            src={resolveImageUrl(user.avatar)}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className={`fi fi-br-circle-user text-[28px] ${avatar.text}`} aria-hidden="true" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[17px] leading-6 font-bold text-on-surface">{user.username}</span>
                        {user.email && (
                          <span className="text-[13px] leading-4 text-gray-400 mt-0.5">{user.email}</span>
                        )}
                      </div>
                    </div>
                    {!isSearchingUsers && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromHistory(user.id) }}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <span className="fi fi-br-cross-small text-[14px] opacity-40" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white px-8 py-4 flex justify-between items-center z-50 rounded-t-[32px] border-t border-gray-100">
        <div className="w-16 h-16 bg-black flex items-center justify-center text-white shadow-lg rounded-full cursor-pointer">
          <span className="fi fi-br-search text-[22px] opacity-80" aria-hidden="true" />
        </div>
        <div
          onClick={() => navigate('/feed')}
          className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <span className="fi fi-br-home text-[22px] opacity-60" aria-hidden="true" />
        </div>
        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
          <span className="fi fi-br-calendar text-[22px] opacity-60" aria-hidden="true" />
        </div>
      </nav>
    </div>
  )
}
