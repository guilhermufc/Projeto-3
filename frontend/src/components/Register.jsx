import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await axios.post('http://localhost:3000/api/auth/register', {
        username,
        email,
        password,
      })

      setSuccess('Conta criada com sucesso! Redirecionando para login...')
      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background flex flex-col font-body-md text-on-surface min-h-screen">
      <header className="bg-transparent flex items-center justify-center w-full px-margin-mobile md:px-margin-desktop flex-col pt-6 pb-1">
        <div className="flex items-center gap-sm justify-center mb-4">
          <span className="material-symbols-outlined text-[#333333] text-headline-md" aria-hidden="true">school</span>
          <h1 className="font-headline-md text-headline-md font-bold text-[#333333]">EduConnect</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile py-10">
        <div className="w-full max-w-[360px] flex flex-col items-center">
          <h1 className="font-headline-md text-[28px] text-[#1A1A1A] font-bold mb-8 text-center mt-4">
            Crie sua conta
          </h1>

          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form className="w-full space-y-4" onSubmit={handleRegister}>
            <div className="relative">
              <span className="fi fi-br-circle-user absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true" />
              <input
                className="w-full minimal-input rounded-xl py-4 pl-12 pr-4 outline-none transition-all font-body-md text-body-md placeholder:text-outline/60"
                id="full_name"
                placeholder="Como quer ser chamado"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative">
              <span className="fi fi-br-envelope absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true" />
              <input
                className="w-full minimal-input rounded-xl py-4 pl-12 pr-4 outline-none transition-all font-body-md text-body-md placeholder:text-outline/60"
                id="email"
                placeholder="seu@email.edu.br"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true">lock</span>
              <input
                className="w-full minimal-input rounded-xl py-4 pl-12 pr-12 outline-none transition-all font-body-md text-body-md placeholder:text-outline/60"
                id="password"
                placeholder="Mínimo 6 caracteres"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <span className="fi fi-br-eye text-outline text-[16px]" aria-hidden="true" />
              </button>
            </div>

            <button
              className="w-full bg-[#8E8E8E] text-white font-bold py-3.5 rounded-full hover:bg-[#7A7A7A] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <div className="w-full mt-8 space-y-3 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-body-md text-[#574fbe] hover:text-[#4339a9] transition-colors"
            >
              Já tem uma conta? <span className="font-bold">Entrar</span>
            </button>
          </div>
        </div>
      </main>

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