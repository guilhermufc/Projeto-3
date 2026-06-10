import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
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
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    fetchPosts()
  }, [navigate])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPosts(response.data || [])
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
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
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleCreatePost = () => {
    navigate('/post')
  }

  return (
    <div className="font-sans text-gray-900 pb-32 min-h-screen">
      {/* BEGIN: Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full">
              <span className="fi fi-br-bell-ring text-[22px] opacity-80" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-colors" onClick={handleLogout}>
          <span className="fi fi-br-circle-user text-[22px] opacity-80" aria-hidden="true" />
        </div>
      </header>
      {/* END: Top Navigation */}

      <main className="px-6 space-y-6 pt-4">
        {/* BEGIN: Feed List */}
        <div className="space-y-4 pb-12">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum post encontrado. Seja o primeiro a compartilhar!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white rounded-[32px] p-6 card-shadow">
                <div className="flex items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      <span className="fi fi-br-circle-user text-[28px] opacity-40" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-500">{post.author}</h3>
                      {post.title && <p className="text-2xl font-extrabold leading-tight text-on-surface">{post.title}</p>}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[17px] leading-relaxed text-on-surface">
                    {post.content}
                  </p>

                  {/* Image preview inside text container, below all text */}
                  {post.image && (
                    <div className="rounded-[28px] overflow-hidden bg-gray-100 mt-4">
                      <img alt="Post" className="w-full h-auto object-contain" src={resolveImageUrl(post.image)} />
                    </div>
                  )}
                </div>

                {post.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories.map((category) => (
                      <span
                        key={`${post.id}-${category}`}
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Save button below image/content, aligned left */}
                <div className="flex items-center justify-start">
                  <button
                    type="button"
                    onClick={() => handleToggleSave(post.id)}
                    className="flex items-center gap-2 rounded-full transition-colors"
                    aria-pressed={Boolean(post.is_saved)}
                    title={post.is_saved ? 'Remover salvo' : 'Salvar'}
                  >
                    <span
                      className={`fi fi-br-bookmark text-[20px] ${post.is_saved ? 'text-[#ff9947] opacity-100' : 'text-gray-400 opacity-60'}`}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-gray-600">{post.saved_count || 0}</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
        {/* END: Feed List */}
      </main>

      {/* BEGIN: Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white px-8 py-4 flex justify-between items-center z-50 rounded-t-[32px] border-t border-gray-100">
        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
          <span className="fi fi-br-search text-[22px] opacity-60" aria-hidden="true" />
        </div>
        <div className="w-16 h-16 bg-black flex items-center justify-center text-white shadow-lg rounded-full cursor-pointer hover:bg-gray-900 transition-colors">
          <span className="fi fi-br-home text-[22px] opacity-80" aria-hidden="true" />
        </div>
        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
          <span className="fi fi-br-calendar text-[22px] opacity-60" aria-hidden="true" />
        </div>
      </nav>
      {/* END: Bottom Navigation */}

      {/* Floating Action Button */}
      <button
        onClick={handleCreatePost}
        className="fixed bottom-32 right-8 bg-[#ff9947] text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40"
      >
        <span className="fi fi-br-plus text-[34px]" aria-hidden="true" />
      </button>
    </div>
  )
}
