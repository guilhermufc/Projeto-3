import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export default function OtherProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profileUser, setProfileUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return ''
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

    fetchProfileAndPosts()
  }, [username, navigate])

  const fetchProfileAndPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Buscamos simultaneamente o perfil e os posts daquele usuário
      const [userRes, postsRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/users/${username}`, { headers }),
        axios.get(`http://localhost:3000/api/posts?author=${username}`, { headers }),
      ])

      setProfileUser(userRes.data)
      setPosts(postsRes.data || [])
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
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
      const response = await axios.post(`http://localhost:3000/api/posts/${postId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const updatedPost = response.data?.post

      if (updatedPost) {
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? { ...post, saved_count: updatedPost.saved_count, is_saved: updatedPost.is_saved }
              : post,
          ),
        )
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error)
    }
  }

  if (loading) {
    return (
      <div className="font-sans text-gray-900 bg-[#F8FAFC] min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Carregando perfil...</p>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="font-sans text-gray-900 bg-[#F8FAFC] min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-slate-500 font-medium text-lg mb-4">Usuário não encontrado.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-200 rounded-full font-bold text-gray-700"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="font-sans text-gray-900 bg-[#F8FAFC] min-h-screen flex flex-col">
      {/* BEGIN: MainHeader */}
      <header className="p-4 pt-6 sticky top-0 z-20 bg-[#F8FAFC]">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 bg-white rounded-2xl px-4 py-3 card-shadow w-[calc(100%-60px)]">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm bg-[#ABF1A9]">
              <span className="fi fi-br-circle-user text-[36px] text-white opacity-80" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-bold leading-tight text-[25px] text-slate-900">{profileUser.username}</h1>
              <p className="text-slate-500 font-medium text-[15px]">
                {posts.length} {posts.length === 1 ? 'Publicação' : 'Publicações'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            aria-label="Fechar"
            className="mt-2 w-11 h-11 rounded-full hover:bg-slate-200 transition-colors flex items-center justify-center bg-white text-[#8B8B8B] card-shadow"
          >
            <span className="fi fi-br-cross text-[20px]" aria-hidden="true" />
          </button>
        </div>
      </header>
      
      {/* Bio Section */}
      {profileUser.bio && (
        <div className="flex px-4 mb-4 justify-start">
          <div className="bg-white rounded-2xl card-shadow flex items-center justify-center px-4 py-2 w-[calc(100%-60px)] min-h-[37px]">
            <span className="font-medium text-[20px] text-black text-center break-words">{profileUser.bio}</span>
          </div>
        </div>
      )}
      {/* END: MainHeader */}

      {/* BEGIN: MainContent */}
      <main className="flex-grow p-4 pb-32">
        <h2 className="text-2xl font-bold mb-4 px-2">Publicações</h2>

        {/* BEGIN: Feed */}
        <section className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">Nenhum post publicado ainda.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white rounded-[32px] p-6 card-shadow relative">
                {/* Categories – top right corner */}
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
                    <div className="w-14 h-14 bg-[#ABF1A9] rounded-full flex items-center justify-center overflow-hidden">
                      <span className="fi fi-br-circle-user text-[28px] text-white opacity-80" aria-hidden="true" />
                    </div>
                    <div className="pr-2">
                      <h3 className="text-[20px] font-bold text-gray-900 hover:text-gray-700 transition-colors">{post.author}</h3>
                      {post.title && <p className="text-[15px] font-bold leading-tight text-gray-600 mt-1">{post.title}</p>}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[18px] font-medium leading-snug text-gray-800">
                    {post.content}
                  </p>

                  {/* Image preview */}
                  {post.image && (
                    <div className="rounded-[28px] overflow-hidden bg-slate-100 mt-4 aspect-[4/3]">
                      <img alt="Post" className="w-full h-full object-cover" src={resolveImageUrl(post.image)} />
                    </div>
                  )}
                </div>

                {/* Save button below image/content, aligned left */}
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
                          className="w-6 h-6"
                          style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(35%) saturate(1637%) hue-rotate(345deg) brightness(103%) contrast(101%)' }}
                        />
                      ) : (
                        <span className="fi fi-br-bookmark text-[24px] text-gray-400 opacity-60" aria-hidden="true" />
                      )}
                    <span className="text-sm font-bold text-gray-400">{post.saved_count || 0}</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
        {/* END: Feed */}
      </main>
      {/* END: MainContent */}

      {/* BEGIN: Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white px-8 py-4 flex justify-between items-center z-50 rounded-t-[32px] border-t border-gray-100 nav-shadow">
        <div
          onClick={() => navigate('/search')}
          className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <span className="fi fi-br-search text-[22px] opacity-60" aria-hidden="true" />
        </div>
        <div 
          onClick={() => navigate('/feed')}
          className="w-16 h-16 bg-black flex items-center justify-center text-white shadow-lg rounded-full cursor-pointer hover:bg-gray-900 transition-colors"
        >
          <span className="fi fi-br-home text-[22px] opacity-80" aria-hidden="true" />
        </div>
        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
          <span className="fi fi-br-calendar text-[22px] opacity-60" aria-hidden="true" />
        </div>
      </nav>
      {/* END: Bottom Navigation */}
    </div>
  )
}
