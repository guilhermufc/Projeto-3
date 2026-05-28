import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Post() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Por favor, escreva algo para compartilhar')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('content', content)

      await axios.post('http://localhost:3000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      navigate('/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar post')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    navigate('/feed')
  }

  return (
    <div className="font-body-md text-body-md min-h-screen flex flex-col items-center bg-background">
      {/* Top Navigation */}
      <header className="w-full max-w-xl flex justify-between items-center px-margin-mobile h-16 bg-transparent">
        <button
          onClick={handleClose}
          className="p-2 cursor-pointer hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-200"
        >
          <span className="text-on-surface-variant text-[32px] leading-none" aria-hidden="true">×</span>
        </button>
        <div className="hidden">
          {/* Trailing action hidden from header as per reference structure */}
        </div>
      </header>

      <main className="w-full max-w-xl px-margin-mobile flex flex-col gap-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Toolbar & Input Area */}
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {/* Attachment Toolbar */}
          {/* Text Input Container */}
          <div className="w-full bg-surface-container-lowest rounded-2xl min-h-[400px] p-md main-card-shadow focus-within:ring-2 focus-within:ring-primary-container transition-all">
            <textarea
              className="w-full h-full border-none focus:ring-0 bg-transparent font-body-lg text-body-lg text-on-surface placeholder-outline-variant resize-none"
              placeholder="Escreva aqui..."
              rows="15"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pb-xl">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#8E9196] text-white font-headline-md text-headline-md px-12 py-3 rounded-full hover:bg-[#7a7d82] active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Postando...' : 'Postar'}
            </button>
          </div>
        </form>
      </main>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-fixed opacity-20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary-fixed opacity-20 blur-[100px] rounded-full"></div>
      </div>
    </div>
  )
}
