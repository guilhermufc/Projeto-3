import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

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

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) {
      return ''
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }

    return `http://localhost:3000${imagePath}`
  }

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    fetchSavedPosts()
  }, [navigate])

  const fetchSavedPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/posts/saved', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPosts(response.data || [])
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

  const handleToggleSave = async (postId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`http://localhost:3000/api/posts/${postId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Como estamos na tela de salvos, remover o post da tela imediatamente
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId))
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
    <div className="font-sans text-gray-900 pb-32 min-h-screen bg-[#F4F4F4]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#F4F4F4]/80 backdrop-blur-md px-6 py-5 flex items-center relative">
        <button
          onClick={() => navigate('/profile')}
          className="absolute left-6 cursor-pointer flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[24px] text-gray-800">
            arrow_back
          </span>
        </button>
        <div className="w-full text-center">
          <h1 className="text-xl font-bold text-gray-800">Salvos</h1>
        </div>
      </header>

      <main className="px-6 space-y-6 pt-4 max-w-md mx-auto">
        {/* Saved Posts List */}
        <div className="space-y-4 pb-12">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando posts salvos...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-6xl text-gray-300">
                bookmark_border
              </span>
              <p className="text-gray-500 font-medium">Nenhum post salvo ainda.</p>
              <button
                onClick={() => navigate('/feed')}
                className="mt-2 bg-[#ff9947] hover:bg-[#e68536] text-white font-semibold py-2.5 px-6 rounded-full shadow-md transition-all active:scale-95 cursor-pointer text-sm"
              >
                Explorar Feed
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white rounded-[32px] p-6 card-shadow relative">
                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="absolute top-5 right-5 flex flex-wrap gap-1 justify-end max-w-[45%]">
                    {post.categories.map((cat) => (
                      <span
                        key={cat}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${categoryStyles[cat] || 'bg-gray-200 text-gray-600'}`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-start mb-5">
                  <div 
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => navigate(`/profile/${post.author}`)}
                  >
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {post.authorAvatar ? (
                        <img
                          src={resolveImageUrl(post.authorAvatar)}
                          alt={post.author}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="fi fi-br-circle-user text-[28px] opacity-40" aria-hidden="true" />
                      )}
                    </div>
                    <div className="pr-2">
                      <h3 className="text-lg font-medium text-gray-500 hover:text-gray-900 transition-colors">{post.author}</h3>
                      {post.title && <p className="text-2xl font-extrabold leading-tight text-on-surface">{post.title}</p>}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[17px] leading-relaxed text-on-surface">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="rounded-[28px] overflow-hidden bg-gray-100 mt-4">
                      <img alt="Post" className="w-full h-auto object-contain" src={resolveImageUrl(post.image)} />
                    </div>
                  )}
                </div>

                {/* Save button */}
                <div className="flex items-center justify-start">
                  <button
                    type="button"
                    onClick={() => handleToggleSave(post.id)}
                    className="flex items-center gap-2 rounded-full transition-colors"
                    aria-pressed={true}
                    title="Remover salvo"
                  >
                    <img
                      src="/icons/bookmark_prenchido.png"
                      alt="Salvo"
                      className="w-5 h-5"
                      style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(35%) saturate(1637%) hue-rotate(345deg) brightness(103%) contrast(101%)' }}
                    />
                    <span className="text-sm text-gray-600">{post.saved_count || 0}</span>
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
