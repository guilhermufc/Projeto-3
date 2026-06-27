import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { put } from '../services/api'
import '../styles/Profile.css' // Importa estilos customizados da tela de perfil (CSS vanilla)

export default function Profile() {
  const navigate = useNavigate()

  // Lê o usuário ativo do cache do navegador
  const user = JSON.parse(localStorage.getItem('user'))
  
  // Estados de controle de modificações locais no perfil
  const [fotoAlterada, setFotoAlterada] = useState(false)
  const [nome, setNome] = useState(user?.username || 'Usuário')
  const [bio, setBio] = useState(user?.bio || '')
  
  // Define o avatar padrão a ser exibido
  const [foto, setFoto] = useState(
     user?.avatar ? `http://localhost:3000${user.avatar}` : null
  )
  
  // Estados auxiliares para comparação de alterações (evita requisições à toa)
  const [nomeSalvo, setNomeSalvo] = useState(user?.username || 'Usuário')
  const [bioSalva, setBioSalva] = useState(user?.bio || '')
  const [fotoArquivo, setFotoArquivo] = useState(null)
  
  // Verifica se o usuário modificou algum dado textual ou imagem
  const nomeAlterado = nome !== nomeSalvo
  const bioAlterada = bio !== bioSalva
  const houveAlteracao = nomeAlterado || bioAlterada || fotoAlterada
  const apenasFotoAlterada = fotoAlterada && !nomeAlterado && !bioAlterada

  // Trata a seleção de arquivo de imagem local e gera a URL de pré-visualização
  function atualizarFoto(event) {
    const arquivo = event.target.files[0]

    if (arquivo) {
      const imagemUrl = URL.createObjectURL(arquivo)
      setFoto(imagemUrl)
      setFotoArquivo(arquivo)
      setFotoAlterada(true)
    }
  }

  // Desloga e limpa a sessão local
  function sair() {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  // Envia as alterações via multipart/form-data (FormData) para o endpoint PUT /api/users/me
  async function salvarAlteracoes() {
    try {
      const formData = new FormData()
      formData.append('username', nome) 
      formData.append('bio', bio)

      if (fotoArquivo) {
        formData.append('avatar', fotoArquivo)
      }

      // Envia os dados usando o wrapper do fetch em services/api.js
      const data = await put('/api/users/me', formData)

      // Atualiza o localStorage com os novos dados do usuário
      localStorage.setItem('user', JSON.stringify(data.user))

      // Reseta os estados auxiliares para ocultar o botão de confirmação
      setNomeSalvo(data.user.username)
      setBioSalva(data.user.bio)

      if (data.user.avatar) {
        setFoto(`http://localhost:3000${data.user.avatar}`)
      }

      setFotoAlterada(false)
      setFotoArquivo(null)

      alert('Alterações salvas com sucesso!')
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao salvar alterações')
    }
  }

  return (
    <div className="profile-container">
      <main className="profile-main">
        <div className="profile-card">
          
          {/* Botão de Fechar no celular (volta pro feed) */}
          <button
            onClick={() => navigate('/feed')}
            className="profile-close-btn"
            title="Voltar"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>

          {/* Área da foto de perfil com botão de upload */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-circle">
              {foto ? (
                <img src={foto} alt="Foto de perfil" />
              ) : (
                <span className="material-symbols-outlined">account_circle</span>
              )}
            </div>

            <label htmlFor="upload-foto" className="profile-avatar-edit-label">
              Editar
            </label>

            <input
              type="file"
              id="upload-foto"
              accept="image/*"
              className="hidden"
              onChange={atualizarFoto}
              style={{ display: 'none' }}
            />
          </div>

          {/* Campo para editar o Nome */}
          <div className="profile-field-box">
            <input
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="profile-field-input"
              title="Clique para editar o nome"
            />
            <span className="profile-field-icon">✎</span>
          </div>

          {/* Campo para editar a Biografia */}
          <div className="profile-field-box profile-field-box-large">
            <input
              type="text"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Biografia..."
              className="profile-field-input profile-field-input-bio"
              title="Clique para editar a biografia"
            />
            <span className="profile-field-icon">✎</span>
          </div>

          {/* Atalho para ir à tela de Posts Salvos */}
          <button
            onClick={() => navigate('/salvos')}
            className="profile-btn-saved"
          >
            <span className="material-symbols-outlined">bookmark</span>
            <span>Salvos</span>
          </button>

          {/* Botão de salvar alterações (exibido apenas se houve modificações) */}
          {houveAlteracao && (
            <button onClick={salvarAlteracoes} className="profile-btn-submit">
              <span>✓</span>
              <span>
                {apenasFotoAlterada ? 'Salvar Foto' : 'Salvar Alterações'}
              </span>
            </button>
          )}

          {/* Botão de sair da conta */}
          <button onClick={sair} className="profile-btn-logout">
            Sair
          </button>
        </div>
      </main>

      {/* Menu de navegação inferior (exibido apenas em celulares) */}
      <nav className="profile-mobile-nav">
        <div onClick={() => navigate('/search')} className="profile-nav-item">
          <span className="fi fi-br-search" aria-hidden="true" />
        </div>
        <div onClick={() => navigate('/feed')} className="profile-nav-item">
          <span className="fi fi-br-home" aria-hidden="true" />
        </div>
        <div onClick={() => navigate('/calendar')} className="profile-nav-item">
          <span className="fi fi-br-calendar" aria-hidden="true" />
        </div>
      </nav>
    </div>
  )
}