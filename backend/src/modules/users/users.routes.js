// Importações de dependências básicas, MongoDB, serializers e middlewares.
// Importações de dependências básicas, MongoDB, serializers e middlewares.
const { Router } = require('express') // Importa o Router do Express para criar rotas.
const { ObjectId } = require('mongodb') // Importa ObjectId do driver MongoDB para trabalhar com IDs de documentos.
const { getCollections } = require('../../config/database') // Importa a função para obter as coleções do MongoDB.
const { serializeUser } = require('../../utils/serializers') // Importa a função para serializar (formatar) dados de usuário.
const { verifyUser } = require('../../middleware/auth') // Importa o middleware de autenticação para verificar o token JWT.
const { upload } = require('../../middleware/upload') // Importa o middleware de upload para lidar com arquivos.

// Inicialização do roteador.
const router = Router() // Cria uma nova instância do roteador do Express.

// Importa e registra as rotas de pesquisa de usuários.
const searchRoutes = require('./users.search.routes')
router.use(searchRoutes)

/**
 * ROTA: PUT /api/users/me
 * DESCRIÇÃO: Permite ao usuário alterar seus próprios dados de perfil (Nome de exibição, biografia e foto de perfil/avatar).
 */
router.put('/api/users/me', verifyUser, upload.single('avatar'), async (req, res) => { // Define uma rota PUT para '/api/users/me' com middlewares de autenticação e upload de avatar.
  const { username, bio } = req.body // Extrai 'username' e 'bio' do corpo da requisição.

  // Validação: Username é obrigatório para manter a consistência do perfil
  if (!username || !username.trim()) { // Verifica se o 'username' não foi fornecido ou está vazio após remover espaços em branco.
    return res.status(400).json({ message: 'Nome de usuário é obrigatório' }) // Retorna um erro 400 se o 'username' for inválido.
  }

  try {
    const { usersCollection, postsCollection } = getCollections() // Obtém as coleções 'users' e 'posts' do banco de dados.
    const userId = new ObjectId(req.userId) // Converte o ID do usuário (obtido do JWT) para um ObjectId do MongoDB.
    const usernameLimpo = username.trim() // Remove espaços em branco do 'username' fornecido.
    const bioLimpa = bio?.trim() || '' // Remove espaços em branco da 'bio' (se existir), ou define como string vazia.

    // Verifica se o novo username escolhido já está sendo usado por outro usuário
    const existingUser = await usersCollection.findOne({ // Busca na coleção de usuários por um 'username' igual ao novo.
      username: usernameLimpo, // O novo 'username' a ser verificado.
      _id: { $ne: userId }, // Exclui o próprio usuário logado da verificação para permitir que ele mantenha o mesmo nome.
    })

    if (existingUser) { // Se um usuário com o mesmo 'username' for encontrado (e não for o próprio usuário).
      return res.status(400).json({ message: 'Nome de usuário já está em uso' }) // Retorna um erro 400 informando que o 'username' já está em uso.
    }

    // Busca o registro atual do usuário para reter o avatar antigo caso ele não faça upload de um novo
    const oldUser = await usersCollection.findOne({ _id: userId }) // Busca os dados atuais do usuário logado na coleção.
    const avatar = req.file ? `/uploads/${req.file.filename}` : oldUser.avatar || null // Define o caminho do avatar: novo arquivo se houver, ou mantém o antigo, ou null.

    // Atualiza os dados cadastrais na coleção de usuários
    await usersCollection.updateOne( // Atualiza um documento na coleção de usuários.
      { _id: userId }, // Filtra para encontrar o usuário pelo seu ID.
      {
        $set: { // Define os novos valores para os campos.
          username: usernameLimpo, // Novo nome de usuário.
          bio: bioLimpa, // Nova biografia.
          avatar, // Caminho do avatar (novo ou antigo).
          updatedAt: new Date(), // Atualiza a data de modificação.
        },
      },
    )

    // Se o usuário mudou o nome de usuário (username), atualiza o campo 'author' de todas as publicações antigas dele
    if (oldUser.username !== usernameLimpo) { // Verifica se o nome de usuário foi realmente alterado.
      await postsCollection.updateMany( // Atualiza vários documentos na coleção de posts.
        { userId }, // Filtra todos os posts feitos por este usuário.
        { $set: { author: usernameLimpo } }, // Atualiza o campo 'author' nos posts com o novo nome de usuário.
      )
    }

    // Busca o cadastro atualizado
    const updatedUser = await usersCollection.findOne({ _id: userId }) // Busca o usuário novamente para obter os dados mais recentes.

    // Retorna apenas os dados do usuário atualizado, sem tokens JWT
    res.json({ // Retorna uma resposta JSON.
      message: 'Perfil atualizado com sucesso', // Mensagem de sucesso.
      user: serializeUser(updatedUser), // Dados do usuário atualizado, formatados.
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil' }) // Em caso de erro, retorna um status 500 com uma mensagem de erro.
  }
})

// O código de pesquisa de usuários foi movido para o arquivo users.search.routes.js.

/**
 * ROTA: GET /api/users/:username
 * DESCRIÇÃO: Obtém os dados de perfil público de outro usuário pelo seu nome de usuário (username).
 */
router.get('/api/users/:username', verifyUser, async (req, res) => { // Define uma rota GET para '/api/users/:username' com middleware de autenticação.
  try {
    const { usersCollection } = getCollections() // Obtém a coleção 'users' do banco de dados.
    const { username } = req.params // Extrai o 'username' dos parâmetros da URL.
    const user = await usersCollection.findOne({ username }) // Busca um usuário na coleção pelo 'username' fornecido.

    // Se o usuário procurado não existir, retorna erro 404
    if (!user) { // Se nenhum usuário for encontrado com o 'username'.
      return res.status(404).json({ message: 'Usuário não encontrado' }) // Retorna um erro 404 informando que o usuário não foi encontrado.
    }

    // Retorna os dados públicos formatados pelo serializer
    res.json(serializeUser(user)) // Retorna os dados do usuário encontrados, formatados pelo serializer.
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil' }) // Em caso de erro, retorna um status 500 com uma mensagem de erro.
  }
})

module.exports = router // Exporta o roteador para ser usado em outros arquivos da aplicação.
