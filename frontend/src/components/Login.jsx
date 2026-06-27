import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../services/api'
import '../styles/Login.css' // Importa estilos customizados da tela (CSS vanilla)

export default function Login() {
  // Estados para gerenciar as credenciais digitadas e controle de loading/erros
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Função assíncrona responsável por enviar os dados de autenticação para a API
  const handleLogin = async (e) => {
    e.preventDefault() // Evita o comportamento padrão de recarregar a página ao submeter o formulário
    setError('') // Reseta o estado de erro
    setLoading(true) // Ativa o estado de carregamento do botão

    try {
      // Faz o POST assíncrono para o endpoint de login através do fetch centralizado do api.js
      const data = await post('/api/auth/login', {
        username,
        password
      })

      // Se o login for bem-sucedido, armazena o usuário localmente e redireciona para o Feed
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/feed')
      }
    } catch (err) {
      // Captura a mensagem de erro retornada pelo servidor ou define uma padrão
      setError(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false) // Desativa o estado de carregamento do botão
    }
  }

  return (
    <div className="login-container">
      {/* TopAppBar - Cabeçalho superior com título do app */}
      <header className="login-header">
        <div className="login-logo-box">
          <span className="material-symbols-outlined login-logo-icon" aria-hidden="true">school</span>
          <h1 className="login-brand-title">EduConnect</h1>
        </div>
      </header>

      {/* Main - Conteúdo central com formulário de login */}
      <main className="login-main">
        <div className="login-box">
          <h2 className="login-subtitle">
            Entrar no Aplicativo
          </h2>

          {/* Exibe mensagem de erro caso o login falhe */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Formulário de Login */}
          <form className="login-form" onSubmit={handleLogin}>
            {/* Campo de Usuário */}
            <div className="login-input-group">
              <span className="fi fi-br-circle-user login-input-icon" aria-hidden="true" />
              <input
                className="login-input minimal-input"
                id="username"
                placeholder="Nome de Usuário"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Campo de Senha */}
            <div className="login-input-group">
              <span className="material-symbols-outlined login-input-icon" aria-hidden="true">lock</span>
              <input
                className="login-input minimal-input"
                id="password"
                placeholder="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Botão de Submissão do Login */}
            <button
              className="login-button-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {/* Link para recuperação/esquecimento de senha */}
            <div className="login-link-container">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="login-link"
              >
                Esqueceu a senha?
              </button>
            </div>
          </form>

          {/* Botão secundário de criação de conta */}
          <div className="login-extra-actions">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="login-button-secondary"
            >
              Criar nova conta
            </button>
          </div>
        </div>
      </main>

      {/* Footer - Rodapé institucional com direitos autorais */}
      <footer className="login-footer">
        <div className="login-footer-content">
          <div className="login-footer-row">
            <span className="login-footer-brand">EduConnect</span>
            <span className="login-footer-copyright">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
