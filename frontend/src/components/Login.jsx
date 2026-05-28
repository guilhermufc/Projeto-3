import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password
      })

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        navigate('/feed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background flex flex-col font-body-md text-on-surface min-h-screen">
      {/* TopAppBar */}
      <header className="bg-transparent flex items-center justify-center w-full px-margin-mobile md:px-margin-desktop flex-col pt-6 pb-1">
        <div className="flex items-center gap-sm justify-center mb-4">
          <span className="material-symbols-outlined text-[#333333] text-headline-md" aria-hidden="true">school</span>
          <h1 className="font-headline-md text-headline-md font-bold text-[#333333]">EduConnect</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile py-10">
        <div className="w-full max-w-[360px] flex flex-col items-center">
          <h2 className="font-headline-md text-[28px] text-[#1A1A1A] font-bold mb-8 text-center mt-4">
            Entrar no Aplicativo
          </h2>

          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form className="w-full space-y-4" onSubmit={handleLogin}>
            {/* Username */}
            <div className="relative">
              <span className="fi fi-br-circle-user absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true" />
              <input
                className="w-full minimal-input rounded-xl py-4 pl-12 pr-4 outline-none transition-all font-body-md text-body-md placeholder:text-outline/60"
                id="username"
                placeholder="Nome de Usuário"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true">lock</span>
              <input
                className="w-full minimal-input rounded-xl py-4 pl-12 pr-12 outline-none transition-all font-body-md text-body-md placeholder:text-outline/60"
                id="password"
                placeholder="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Login Button */}
            <button
              className="w-full bg-[#8E8E8E] text-white font-bold py-3.5 rounded-full hover:bg-[#7A7A7A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {/* Forgot Password */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-body-md text-[#8E8E8E] hover:text-[#333333] transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          </form>

          <div className="w-full mt-6 space-y-2">
            {/* Create Account */}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full bg-[#D1C9FF] text-[#574fbe] font-bold py-3.5 rounded-full hover:bg-[#C4BAFF] active:scale-[0.98] transition-all"
            >
              Criar nova conta
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-margin-mobile md:px-margin-desktop border-t border-[#E0E0E0] mt-auto">
        <div className="max-w-[1200px] mx-auto flex flex-col justify-between items-center gap-4 text-[#8E8E8E]">
          <div className="flex items-center justify-center gap-xs w-full">
            <span className="font-label-md text-label-md font-bold text-[#333333]">EduConnect</span>
            <span className="font-body-sm text-body-sm">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
