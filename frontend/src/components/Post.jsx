import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const categoryOptions = ['Métodos', 'Leitura', 'Registro']
const categoryStyles = {
  Métodos: 'bg-[#FFAB6D] text-white',
  Leitura: 'bg-[#FF85D1] text-white',
  Registro: 'bg-[#A3A1FF] text-white',
}

export default function Post() {
  const [title, setTitle] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const attachmentInputRef = useRef(null)
  const textareaRef = useRef(null)

  const toggleCategory = (category) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((item) => item !== category)
        : [...currentCategories, category],
    )
  }

  const openAttachmentPicker = () => {
    attachmentInputRef.current?.click()
  }

  const handleAttachmentChange = (event) => {
    const nextImage = event.target.files?.[0] || null
    setSelectedImage(nextImage)
  }

  const cancelImageSelection = () => {
    setSelectedImage(null)

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(selectedImage)
    setImagePreviewUrl(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedImage])

  useEffect(() => {
    // Auto-grow textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [content])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Por favor, informe um título para a publicação')
      return
    }

    if (!content.trim()) {
      setError('Por favor, escreva algo para compartilhar')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      formData.append('categories', JSON.stringify(selectedCategories))

      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      await axios.post('http://localhost:3000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      <header className="w-full max-w-xl flex justify-between items-center px-margin-mobile h-16 bg-transparent">
        <button
          onClick={handleClose}
          className="p-2 cursor-pointer hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-200"
        >
          <span className="text-on-surface-variant text-[32px] leading-none" aria-hidden="true">×</span>
        </button>
        <div className="hidden" />
      </header>

      <main className="w-full max-w-xl px-margin-mobile flex flex-col gap-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="bg-surface-container-lowest rounded-2xl p-md main-card-shadow flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="font-headline-md text-headline-md text-on-surface">Título</span>
              <input
                className="w-full border-none focus:ring-0 bg-transparent font-body-lg text-body-lg text-on-surface placeholder-outline-variant px-0"
                placeholder="Dê um título para a publicação"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-surface-container-lowest rounded-2xl p-md main-card-shadow focus-within:ring-2 focus-within:ring-primary-container transition-all">
              <textarea
                ref={textareaRef}
                className="w-full border-none focus:ring-0 bg-transparent font-body-lg text-body-lg text-on-surface placeholder-outline-variant resize-none overflow-hidden"
                placeholder="Escreva aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="4"
              />

              {imagePreviewUrl && (
                <div className="overflow-hidden rounded-[16px] bg-surface-container-highest mt-4 w-32 h-32">
                  <img
                    src={imagePreviewUrl}
                    alt="Pré-visualização da imagem"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={openAttachmentPicker}
                className="text-on-surface-variant hover:text-primary transition-colors active:scale-90"
                aria-label="Adicionar imagem"
              >
                <span className="material-symbols-outlined text-[32px]" aria-hidden="true">image</span>
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-md main-card-shadow flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <img src="/icons/categorias.png" alt="Categorias" className="w-8 h-8" />
                <h1 className="font-headline-md text-headline-md text-on-surface">Categorias</h1>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap">
                {categoryOptions.map((category) => {
                  const selected = selectedCategories.includes(category)

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`px-6 py-2 ${selected ? categoryStyles[category] : 'bg-surface-container-high text-on-surface-variant'} font-label-md text-label-md rounded-full active:scale-95 transition-transform chip-shadow whitespace-nowrap`}
                      aria-pressed={selected}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <input
            ref={attachmentInputRef}
            type="file"
            accept="image/*"
            onChange={handleAttachmentChange}
            className="hidden"
          />

          <div className="flex justify-start pb-xl">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#8E9196] text-white font-headline-md text-headline-md px-12 py-3 rounded-full hover:bg-on-surface-variant active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Postando...' : 'Postar'}
            </button>
          </div>
        </form>
      </main>

      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-fixed opacity-20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary-fixed opacity-20 blur-[100px] rounded-full"></div>
      </div>
    </div>
  )
}
