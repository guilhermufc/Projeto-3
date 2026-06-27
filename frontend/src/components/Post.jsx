import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post as apiPost } from '../services/api'
import '../styles/Post.css' // Importa estilos customizados da tela (CSS vanilla)

// Opções de categorias de postagem disponíveis
const categoryOptions = ['Métodos', 'Leitura', 'Registro', 'Tutorial', 'Dica', 'Pergunta', 'Resposta', 'Artigo', 'Vídeo', 'Experiência', 'Projeto', 'Recurso', 'Dúvida', 'Discussão', 'Evento', 'Anúncio', 'Caso de Uso', 'Pesquisa', 'Ferramenta', 'Desafio']

// Mapeamento de estilos dinâmicos de categorias
const categoryStyles = {
  Métodos: 'bg-[#FFAB6D] text-white',
  Leitura: 'bg-[#FF85D1] text-white',
  Registro: 'bg-[#A3A1FF] text-white',
  Tutorial: 'bg-[#5BA3FF] text-white',
  Dica: 'bg-[#FF6B9D] text-white',
  Pergunta: 'bg-[#FFC75F] text-white',
  Resposta: 'bg-[#88D498] text-white',
  Artigo: 'bg-[#FF9E64] text-white',
  Vídeo: 'bg-[#7AA2F7] text-white',
  Experiência: 'bg-[#BB9AF7] text-white',
  Projeto: 'bg-[#7DCFFF] text-white',
  Recurso: 'bg-[#9ECE6A] text-white',
  Dúvida: 'bg-[#E0AF68] text-white',
  Discussão: 'bg-[#73DACA] text-white',
  Evento: 'bg-[#F7768E] text-white',
  Anúncio: 'bg-[#FF007F] text-white',
  'Caso de Uso': 'bg-[#00D9FF] text-white',
  Pesquisa: 'bg-[#B469D9] text-white',
  Ferramenta: 'bg-[#FFD700] text-white',
  Desafio: 'bg-[#FF4500] text-white',
}

export default function Post({ isModal = false, onClose = null }) {
  const [title, setTitle] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  // Referência ao input de arquivo oculto para anexar imagem
  const attachmentInputRef = useRef(null)
  // Referência para redimensionamento automático do textarea de texto
  const textareaRef = useRef(null)

  // Alterna a seleção de uma categoria (liga/desliga tag)
  const toggleCategory = (category) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((item) => item !== category)
        : [...currentCategories, category],
    )
  }

  // Simula o clique no input de arquivo quando clica no ícone de imagem
  const openAttachmentPicker = () => {
    attachmentInputRef.current?.click()
  }

  // Monitora a escolha do arquivo de imagem
  const handleAttachmentChange = (event) => {
    const nextImage = event.target.files?.[0] || null
    setSelectedImage(nextImage)
  }

  // Desfaz a seleção da imagem limpa a visualização
  const cancelImageSelection = () => {
    setSelectedImage(null)

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = ''
    }
  }

  // Gera e revoga URLs locais de visualização para evitar vazamentos de memória
  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(selectedImage)
    setImagePreviewUrl(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedImage])

  // Ajusta automaticamente a altura do textarea de forma elegante com base no texto digitado
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [content])

  // Submete a publicação usando Multipart FormData
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
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      formData.append('categories', JSON.stringify(selectedCategories))

      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      await apiPost('/api/posts', formData)

      if (isModal) {
        onClose?.()
        window.location.reload() // Recarrega a página ao salvar pelo modal
      } else {
        navigate('/feed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar post')
    } finally {
      setLoading(false)
    }
  }

  // Executa fechamento do formulário
  const handleClose = () => {
    if (isModal) {
      onClose?.()
    } else {
      navigate('/feed')
    }
  }

  // JSX de Renderização caso seja instanciado em modo Modal
  if (isModal) {
    return (
      <div className="post-modal-container no-scrollbar">
        <header className="post-form-header">
          <span className="title">Nova Publicação</span>
          <button
            type="button"
            onClick={handleClose}
            className="post-close-btn"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        {error && (
          <div className="post-error-alert">
            {error}
          </div>
        )}

        <form className="post-form-body" onSubmit={handleSubmit}>
          {/* Input de Título */}
          <div className="post-input-box">
            <label className="post-input-label">
              <span>Título</span>
              <input
                className="post-title-input"
                placeholder="Dê um título para a publicação"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          </div>

          {/* Campo de Escrita principal */}
          <div className="post-form-body">
            <div className="post-content-box">
              <textarea
                ref={textareaRef}
                className="post-content-textarea"
                placeholder="Escreva aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="4"
              />

              <div className="post-content-footer">
                {imagePreviewUrl && (
                  <div className="post-img-preview">
                    <img
                      src={imagePreviewUrl}
                      alt="Pré-visualização"
                    />
                    <button
                      type="button"
                      onClick={cancelImageSelection}
                      className="post-img-cancel-btn"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* Seletor de Imagem */}
                <div className="post-image-picker-row">
                  <button
                    type="button"
                    onClick={openAttachmentPicker}
                    className="post-image-picker-btn"
                    aria-label="Adicionar imagem"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">image</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Seleção de Categorias */}
            <div className="post-categories-box">
              <div className="post-categories-title-row">
                <img src="/icons/categorias.png" alt="Categorias" />
                <h1>Categorias</h1>
              </div>

              <div className="post-categories-list no-scrollbar">
                {categoryOptions.map((category) => {
                  const selected = selectedCategories.includes(category)

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`post-category-chip ${selected ? categoryStyles[category] : ''}`}
                      aria-pressed={selected}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Input de arquivo oculto */}
          <input
            ref={attachmentInputRef}
            type="file"
            accept="image/*"
            onChange={handleAttachmentChange}
            style={{ display: 'none' }}
          />

          <div className="post-submit-row">
            <button
              type="submit"
              disabled={loading}
              className="post-submit-btn"
            >
              {loading ? 'Postando...' : 'Postar'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // JSX de Renderização caso seja instanciado em modo Página Inteira (Full page)
  return (
    <div className="post-page-container">
      <header className="post-form-header" style={{ maxWidth: '42rem', padding: '0 16px' }}>
        <button
          onClick={handleClose}
          className="post-close-btn"
          title="Fechar"
        >
          <span style={{ fontSize: '32px' }} aria-hidden="true">×</span>
        </button>
      </header>

      <main className="post-form-body" style={{ width: '100%', maxWidth: '42rem', padding: '0 16px' }}>
        {error && (
          <div className="post-error-alert">
            {error}
          </div>
        )}

        <form className="post-form-body" onSubmit={handleSubmit}>
          <div className="post-input-box">
            <label className="post-input-label">
              <span>Título</span>
              <input
                className="post-title-input"
                placeholder="Dê um título para a publicação"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          </div>

          <div className="post-form-body">
            <div className="post-content-box">
              <textarea
                ref={textareaRef}
                className="post-content-textarea"
                placeholder="Escreva aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="4"
              />

              <div className="post-content-footer">
                {imagePreviewUrl && (
                  <div className="post-img-preview">
                    <img
                      src={imagePreviewUrl}
                      alt="Pré-visualização"
                    />
                    <button
                      type="button"
                      onClick={cancelImageSelection}
                      className="post-img-cancel-btn"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="post-image-picker-row">
                  <button
                    type="button"
                    onClick={openAttachmentPicker}
                    className="post-image-picker-btn"
                    aria-label="Adicionar imagem"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">image</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="post-categories-box">
              <div className="post-categories-title-row">
                <img src="/icons/categorias.png" alt="Categorias" />
                <h1>Categorias</h1>
              </div>

              <div className="post-categories-list no-scrollbar">
                {categoryOptions.map((category) => {
                  const selected = selectedCategories.includes(category)

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`post-category-chip ${selected ? categoryStyles[category] : ''}`}
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
            style={{ display: 'none' }}
          />

          <div className="post-submit-row">
            <button
              type="submit"
              disabled={loading}
              className="post-submit-btn"
            >
              {loading ? 'Postando...' : 'Postar'}
            </button>
          </div>
        </form>
      </main>

      {/* Blobs coloridos de decoração de fundo */}
      <div className="post-bg-decorations">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>
    </div>
  )
}
