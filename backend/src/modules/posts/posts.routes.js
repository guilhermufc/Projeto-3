// Importações de utilitários do express, banco de dados, serializadores e middlewares.
const { Router } = require('express')
const { ObjectId } = require('mongodb')
const { getCollections } = require('../../config/database')
const { serializePost } = require('../../utils/serializers')
const { verifyUser } = require('../../middleware/auth')
const { upload } = require('../../middleware/upload')

// Inicializa o roteador.
const router = Router()

/**
 * ROTA: GET /api/posts
 * DESCRIÇÃO: Retorna todos os posts cadastrados. Aceita parâmetros de busca opcionais como 'category' e 'author'.
 * PROTEÇÃO: Exige envio de identificação de usuário válida nos cabeçalhos.
 */
router.get('/api/posts', verifyUser, async (req, res) => {
  try {
    const { postsCollection, usersCollection } = getCollections()
    const { category, author } = req.query
    const filter = {}

    // Adiciona os filtros dinamicamente caso venham na query params
    if (category) filter.categories = category
    if (author) filter.author = author

    // Busca os posts correspondentes ordenando decrescentemente (mais novos primeiro)
    const posts = await postsCollection.find(filter).sort({ createdAt: -1 }).toArray()

    // Para cada post, busca informações adicionais do autor (como o avatar do usuário logado)
    const postsWithAuthor = await Promise.all(
      posts.map(async (post) => {
        const authorUser = await usersCollection.findOne({ _id: post.userId })

        return {
          ...serializePost(post),
          authorAvatar: authorUser?.avatar || null,
          // Verifica se o ID do usuário logado está inserido no array de posts salvos (savedBy)
          is_saved: (post.savedBy || []).includes(req.userId),
        }
      }),
    )

    res.json(postsWithAuthor)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar posts' })
  }
})

/**
 * ROTA: GET /api/posts/saved
 * DESCRIÇÃO: Lista apenas os posts que foram marcados/salvos pelo usuário ativo.
 */
router.get('/api/posts/saved', verifyUser, async (req, res) => {
  try {
    const { postsCollection, usersCollection } = getCollections()
    const userId = req.userId

    // Busca todos os posts onde o ID do usuário atual esteja incluído no array 'savedBy'
    const posts = await postsCollection
      .find({ savedBy: userId })
      .sort({ createdAt: -1 })
      .toArray()

    // Formata o retorno incluindo o avatar atualizado do autor
    const postsWithAuthor = await Promise.all(
      posts.map(async (post) => {
        const authorUser = await usersCollection.findOne({ _id: post.userId })

        return {
          ...serializePost(post),
          authorAvatar: authorUser?.avatar || null,
          is_saved: true, // Já sabemos que está salvo porque filtramos diretamente no find() acima
        }
      }),
    )

    res.json(postsWithAuthor)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar posts salvos' })
  }
})

/**
 * ROTA: POST /api/posts/:postId/save
 * DESCRIÇÃO: Favorita ou remove o favoritar de um post específico (sistema de toggle).
 */
router.post('/api/posts/:postId/save', verifyUser, async (req, res) => {
  try {
    const { postsCollection } = getCollections()
    const { postId } = req.params
    const userId = req.userId

    // Verifica se o formato do ID enviado é um ObjectId válido do MongoDB
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Post inválido' })
    }

    const postObjectId = new ObjectId(postId)
    // Encontra o post no banco de dados
    const post = await postsCollection.findOne({ _id: postObjectId })

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' })
    }

    const savedBy = post.savedBy || []
    const isSaved = savedBy.includes(userId)

    if (isSaved) {
      // Se o usuário já tiver salvo, remove o ID dele da lista (desfazer salvamento)
      await postsCollection.updateOne(
        { _id: postObjectId },
        { $pull: { savedBy: userId } },
      )
    } else {
      // Se não tiver salvo, adiciona o ID dele no array savedBy (salvar post)
      await postsCollection.updateOne(
        { _id: postObjectId },
        { $addToSet: { savedBy: userId } },
      )
    }

    // Busca o post modificado atualizado para retornar a nova contagem ao frontend
    const updatedPost = await postsCollection.findOne({ _id: postObjectId })

    res.json({
      message: isSaved ? 'Salvamento removido' : 'Post salvo com sucesso',
      post: {
        ...serializePost(updatedPost),
        is_saved: !isSaved,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao alternar salvamento' })
  }
})

/**
 * ROTA: POST /api/posts
 * DESCRIÇÃO: Cria uma nova publicação. Suporta o upload de uma imagem (anexo).
 */
router.post('/api/posts', verifyUser, upload.single('image'), async (req, res) => {
  const { title, content } = req.body
  const categoriesInput = req.body.categories

  // Validação: Título e conteúdo do post são campos obrigatórios
  if (!title || !content) {
    return res.status(400).json({ message: 'Título e conteúdo são obrigatórios' })
  }

  try {
    const { postsCollection } = getCollections()

    let categories = []
    // Converte a string JSON de categorias (que vem do FormData) em um array
    if (categoriesInput) {
      try {
        categories = JSON.parse(categoriesInput)
      } catch (_error) {
        categories = []
      }
    }

    // Define o caminho da imagem de forma relativa caso o usuário tenha feito upload de arquivo
    const image = req.file ? `/uploads/${req.file.filename}` : null
    const attachments = req.file
      ? [{
          name: req.file.originalname,
          url: `/uploads/${req.file.filename}`,
          mimetype: req.file.mimetype,
          size: req.file.size,
        }]
      : []
    const userId = new ObjectId(req.userId)

    // Insere o documento da nova publicação na coleção de posts
    await postsCollection.insertOne({
      userId,
      author: req.username,
      title,
      categories,
      content,
      image,
      attachments,
      savedBy: [], // Inicia sem nenhum salvamento
      createdAt: new Date(),
    })

    res.status(201).json({ message: 'Post criado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar post' })
  }
})

module.exports = router
