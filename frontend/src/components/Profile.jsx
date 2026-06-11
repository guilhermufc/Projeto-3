import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user'))
  const [nome, setNome] = useState(user?.username || 'Usuário')
  const [bio, setBio] = useState('')
  const [foto, setFoto] = useState(null)

  function atualizarFoto(event) {
    const arquivo = event.target.files[0]

    if (arquivo) {
      const imagemUrl = URL.createObjectURL(arquivo)
      setFoto(imagemUrl)
    }
  }

  function sair() {
    alert(`Até logo, ${nome}! Fazendo logout...`)
    navigate('/login')
  }
  function salvarAlteracoes() {
    const user = JSON.parse(localStorage.getItem('user'))

    const usuarioAtualizado = {
      ...user,
      username: nome,
      bio: bio
    }

    localStorage.setItem('user', JSON.stringify(usuarioAtualizado))

    alert('Alterações salvas com sucesso!')
  }
  return (
    <main className="min-h-screen font-sans p-4 bg-[#F4F4F4] flex justify-center pt-8">
      <div className="relative w-full max-w-md bg-[#F4F4F4] p-6 rounded-3xl flex flex-col items-center gap-9">
        <button
          onClick={() => navigate('/feed')}
          className="absolute top-6 left-6 cursor-pointer"
        >
          <span
            className="material-symbols-outlined text-[28px] text-[#333333]"
            aria-hidden="true"
          >
            close
          </span>
        </button>

        <div className="relative flex flex-col items-center mt-4">
          <div className="w-32 h-32 bg-[#A2E9A6] rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
            {foto ? (
              <img src={foto} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-6xl">👤</span>
            )}
          </div>

          <label
            htmlFor="upload-foto"
            className="absolute -bottom-2 bg-gray-500/80 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer transition-all shadow-sm"
          >
            Editar
          </label>

          <input
            type="file"
            id="upload-foto"
            accept="image/*"
            className="hidden"
            onChange={atualizarFoto}
          />
        </div>

        <div className="w-full bg-white rounded-xl px-4 py-5 flex items-center justify-between shadow-xs border border-gray-100">
          <input
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="w-full font-bold text-center text-gray-800 text-lg bg-transparent focus:outline-none"
            title="Clique para editar o nome"
          />
          <span className="text-gray-400 ml-2">✎</span>
        </div>

        <div className="w-full bg-white rounded-xl px-4 py-6 flex items-center justify-between shadow-xs border border-gray-100">
          <input
            type="text"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Biografia..."
            className="w-full text-center text-gray-800 font-medium bg-transparent focus:outline-none placeholder-gray-300"
            title="Clique para editar a biografia"
          />
          <span className="text-gray-400 ml-2">✎</span>
        </div>

        <button className="w-3/4 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-5 px-6 rounded-xl flex items-center justify-center gap-3 shadow-xs border border-gray-100 transition-all active:scale-98 cursor-pointer">
          <span className="text-[#A78BFA] text-lg">🔖</span>
          <span className="text-lg">Salvos</span>
        </button>

        <button
          onClick={salvarAlteracoes}
          className="w-3/4 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-5 px-6 rounded-xl flex items-center justify-center gap-3 shadow-xs border border-gray-100 transition-all active:scale-98 cursor-pointer"
        >
          <span className="text-green-500 text-lg">✓</span>
          <span className="text-lg">Salvar Alterações</span>
      </button>

        <button
          onClick={sair}
          className="mt-2 w-32 bg-[#FF80DF] hover:bg-[#ff66d6] text-white font-medium py-2 rounded-full shadow-md transition-all active:scale-95 cursor-pointer text-center"
        >
          Sair
        </button>
      </div>
    </main>
  )
}