import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../services/api'
import '../styles/Register.css' // Importa estilos customizados da tela (CSS vanilla)

export default function Register() {
  // Estados para gerenciar os inputs do usuário no cadastro
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Handler executado quando o usuário envia o formulário de cadastro
  const handleRegister = async (e) => {
    e.preventDefault() // Evita reload de página
    setError('') // Limpa erros antigos
    setSuccess('') // Limpa mensagens de sucesso antigas

    // Validações básicas de preenchimento de campos obrigatórios
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos')
      return
    }

    // Regra de validação: tamanho da senha
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true) // Ativa loading no botão de cadastro

    try {
      // Envia os dados cadastrais para o servidor
      await post('/api/auth/register', {
        username,
        email,
        password,
      })

      // Informa o sucesso e agenda o redirecionamento para o login
      setSuccess('Conta criada com sucesso! Redirecionando para login...')
      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (err) {
      // Captura mensagem de erro do servidor
      setError(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setLoading(false) // Desativa loading
    }
  }

  return (
    <div className="register-container">
      {/* Cabeçalho com logo e título */}
      <header className="register-header">
        <div className="register-logo-box">
          <span className="material-symbols-outlined register-logo-icon" aria-hidden="true">school</span>
          <h1 className="register-brand-title">EduConnect</h1>
        </div>
      </header>

      {/* Seção central com o formulário */}
      <main className="register-main">
        <div className="register-box">
          <h1 className="register-subtitle">
            Crie sua conta
          </h1>

          {/* Renderização condicional de erros */}
          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          {/* Renderização condicional de feedback de sucesso */}
          {success && (
            <div className="register-success">
              {success}
            </div>
          )}

          <form className="register-form" onSubmit={handleRegister}>
            {/* Campo: Nome/Como quer ser chamado */}
            <div className="register-input-group">
              <span className="fi fi-br-circle-user register-input-icon" aria-hidden="true" />
              <input
                className="register-input minimal-input"
                id="full_name"
                placeholder="Como quer ser chamado"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Campo: Email */}
            <div className="register-input-group">
              <span className="fi fi-br-envelope register-input-icon" aria-hidden="true" />
              <input
                className="register-input minimal-input"
                id="email"
                placeholder="seu@email.edu.br"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Campo: Senha com botão de alternar visibilidade */}
            <div className="register-input-group">
              <span className="material-symbols-outlined register-input-icon" aria-hidden="true">lock</span>
              <input
                className="register-input minimal-input"
                id="password"
                placeholder="Mínimo 6 caracteres"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="register-eye-btn"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <span className="fi fi-br-eye register-input-icon-eye" aria-hidden="true" />
              </button>
            </div>

            {/* Botão de cadastro */}
            <button
              className="register-button-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          {/* Link para retornar ao Login */}
          <div className="register-link-container">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="register-link"
            >
              Já tem uma conta? <span className="bold">Entrar</span>
            </button>
          </div>
        </div>
      </main>

      {/* Rodapé da página */}
      <footer className="register-footer">
        <div className="register-footer-content">
          <div className="register-footer-row">
            <span className="register-footer-brand">EduConnect</span>
            <span className="register-footer-copyright">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}