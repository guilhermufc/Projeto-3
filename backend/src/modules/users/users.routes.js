// Importações de dependências básicas, MongoDB, serializers e middlewares.
const { Router } = require('express')
const { ObjectId } = require('mongodb')
const { getCollections } = require('../../config/database')
const { serializeUser } = require('../../utils/serializers')
const { verifyUser } = require('../../middleware/auth')
const { upload } = require('../../middleware/upload')

// Inicialização do roteador.
const router = Router()

/**
 * ROTA: PUT /api/users/me
 * DESCRIÇÃO: Permite ao usuário alterar seus próprios dados de perfil (Nome de exibição, biografia e foto de perfil/avatar).
 */
router.put('/api/users/me', verifyUser, upload.single('avatar'), async (req, res) => {
  const { username, bio } = req.body

  // Validação: Username é obrigatório para manter a consistência do perfil
  if (!username || !username.trim()) {
    return res.status(400).json({ message: 'Nome de usuário é obrigatório' })
  }

  try {
    const { usersCollection, postsCollection } = getCollections()
    const userId = new ObjectId(req.userId)
    const usernameLimpo = username.trim()
    const bioLimpa = bio?.trim() || ''

    // Verifica se o novo username escolhido já está sendo usado por outro usuário
    const existingUser = await usersCollection.findOne({
      username: usernameLimpo,
      _id: { $ne: userId }, // Exclui o próprio usuário logado da verificação
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Nome de usuário já está em uso' })
    }

    // Busca o registro atual do usuário para reter o avatar antigo caso ele não faça upload de um novo
    const oldUser = await usersCollection.findOne({ _id: userId })
    const avatar = req.file ? `/uploads/${req.file.filename}` : oldUser.avatar || null

    // Atualiza os dados cadastrais na coleção de usuários
    await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          username: usernameLimpo,
          bio: bioLimpa,
          avatar,
          updatedAt: new Date(),
        },
      },
    )

    // Se o usuário mudou o nome de usuário (username), atualiza o campo 'author' de todas as publicações antigas dele
    if (oldUser.username !== usernameLimpo) {
      await postsCollection.updateMany(
        { userId },
        { $set: { author: usernameLimpo } },
      )
    }

    // Busca o cadastro atualizado
    const updatedUser = await usersCollection.findOne({ _id: userId })

    // Retorna apenas os dados do usuário atualizado, sem tokens JWT
    res.json({
      message: 'Perfil atualizado com sucesso',
      user: serializeUser(updatedUser),
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil' })
  }
})

/**
 * ROTA: GET /api/users/search
 * DESCRIÇÃO: Pesquisa de usuários cadastrados por correspondência parcial no username (case-insensitive).
 */
router.get('/api/users/search', verifyUser, async (req, res) => {
  const { q } = req.query

  // Retorna um array vazio se o termo de busca não for enviado ou for em branco
  if (!q || q.trim().length === 0) {
    return res.json([])
  }

  try {
    const { usersCollection } = getCollections()
    // Escapa caracteres especiais do RegExp para evitar ataques de injeção de expressão regular
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    
    // Faz a consulta retornando os usuários com correspondência no nome, ocultando as senhas por segurança
    const users = await usersCollection
      .find({ username: { $regex: regex } })
      .project({ password: 0 }) // Exclui a senha do resultado
      .limit(20) // Limita a busca a 20 resultados
      .toArray()

    // Retorna os dados mapeados para o formato seguro esperado pelo frontend
    res.json(
      users.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        avatar: u.avatar || null,
      })),
    )
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' })
  }
})

/**
 * ROTA: GET /api/users/:username
 * DESCRIÇÃO: Obtém os dados de perfil público de outro usuário pelo seu nome de usuário (username).
 */
router.get('/api/users/:username', verifyUser, async (req, res) => {
  try {
    const { usersCollection } = getCollections()
    const { username } = req.params
    const user = await usersCollection.findOne({ username })

    // Se o usuário procurado não existir, retorna erro 404
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    // Retorna os dados públicos formatados pelo serializer
    res.json(serializeUser(user))
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil' })
  }
})

module.exports = router
