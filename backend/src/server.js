const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { MongoClient, ObjectId } = require('mongodb')
const { MongoMemoryServer } = require('mongodb-memory-server')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

const uploadDir = path.join(process.cwd(), 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      const extension = path.extname(file.originalname || '')
      cb(null, `${uniqueSuffix}${extension}`)
    },
  }),
})

let mongoClient
let mongoMemoryServer
let usersCollection
let postsCollection
let schedulesCollection

app.use(express.json())
app.use(
  cors({
    origin: [allowedOrigin, 'http://localhost:5173'],
  }),
)
app.use('/uploads', express.static(uploadDir))

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id
    req.username = decoded.username
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}

const serializeUser = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  bio: user.bio || '',
  avatar: user.avatar || null,
})

const serializePost = (post) => ({
  id: post._id.toString(),
  user_id: post.userId?.toString?.() || post.userId,
  author: post.author,
  title: post.title,
  categories: post.categories || [],
  content: post.content,
  image: post.image || null,
  attachments: post.attachments || [],
  saved_count: post.savedBy?.length || 0,
  created_at: post.createdAt || null,
})

const resetDatabaseWithDefaultAdmin = async () => {
  const defaultAdmin = {
    username: 'admin',
    email: 'admin@educonnect.local',
    password: bcrypt.hashSync('admin', 8),
    bio: 'Amo ensinar pessoas.',
    createdAt: new Date(),
  }

  const userMaria = {
    username: 'mariasilva',
    email: 'maria@educonnect.local',
    password: bcrypt.hashSync('maria123', 8),
    bio: 'Professora de Língua Portuguesa apaixonada por leitura e escrita.',
    createdAt: new Date(),
  }

  const userJoao = {
    username: 'joaosouza',
    email: 'joao@educonnect.local',
    password: bcrypt.hashSync('joao123', 8),
    bio: 'Estudante de engenharia e entusiasta de tecnologia.',
    createdAt: new Date(),
  }

  await postsCollection.deleteMany({})
  await usersCollection.deleteMany({})

  const usersResult = await usersCollection.insertMany([defaultAdmin, userMaria, userJoao])
  const adminId = usersResult.insertedIds[0]
  const mariaId = usersResult.insertedIds[1]
  const joaoId = usersResult.insertedIds[2]

  const seedPosts = [
    {
      userId: mariaId,
      author: 'mariasilva',
      title: 'Dicas de Leitura Crítica',
      categories: ['Leitura', 'Dica'],
      content: 'A leitura crítica vai além de simplesmente absorver o conteúdo. Tente se perguntar quais são as intenções do autor e como ele constrói seus argumentos.',
      image: null,
      attachments: [],
      savedBy: [],
      createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    },
    {
      userId: joaoId,
      author: 'joaosouza',
      title: 'Tutorial de Introdução ao React',
      categories: ['Tutorial', 'Métodos'],
      content: 'Hoje montei um guia passo a passo de como criar seu primeiro app com React. Deixem suas dúvidas nos comentários.',
      image: null,
      attachments: [],
      savedBy: [],
      createdAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    },
    {
      userId: adminId,
      author: 'admin',
      title: 'Bem-vindo ao EduConnect',
      categories: ['Anúncio'],
      content: 'Olá a todos! Este é o ambiente de testes do EduConnect. Sinta-se livre para explorar, criar posts e testar a busca.',
      image: null,
      attachments: [],
      savedBy: [],
      createdAt: new Date(Date.now() - 3600000 * 10), // 10 hours ago
    }
  ]

  await postsCollection.insertMany(seedPosts)
}

const connectDatabase = async () => {
  const connectionString = process.env.MONGODB_URI
  let effectiveUri = connectionString

  if (!effectiveUri) {
    mongoMemoryServer = await MongoMemoryServer.create()
    effectiveUri = mongoMemoryServer.getUri()
  }

  mongoClient = new MongoClient(effectiveUri)
  await mongoClient.connect()

  const databaseName = process.env.MONGODB_DB_NAME || 'educonnect'
  const database = mongoClient.db(databaseName)
  usersCollection = database.collection('users')
  postsCollection = database.collection('posts')
  schedulesCollection = database.collection('schedules')

  await usersCollection.createIndex({ username: 1 }, { unique: true })
  await usersCollection.createIndex({ email: 1 }, { unique: true })
  await postsCollection.createIndex({ createdAt: -1 })
  await schedulesCollection.createIndex({ userId: 1, date: 1 })

  await resetDatabaseWithDefaultAdmin()
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: 'mongodb' })
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios' })
  }

  try {
    const user = await usersCollection.findOne({ username })

    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' })
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' })
    }

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' },
    )

    res.json({
      token,
      user: serializeUser(user),
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' })
  }
})

app.get('/api/posts', verifyToken, async (req, res) => {
  try {
    const { category, author } = req.query
    const filter = {}
    if (category) filter.categories = category
    if (author) filter.author = author
    const posts = await postsCollection.find(filter).sort({ createdAt: -1 }).toArray()
    
    const postsWithAuthor = await Promise.all(
      posts.map(async (post) => {
        const authorUser = await usersCollection.findOne({ _id: post.userId })

        return {
          ...serializePost(post),
          authorAvatar: authorUser?.avatar || null,
          is_saved: (post.savedBy || []).includes(req.userId),
        }
      }),
    )

    res.json(postsWithAuthor)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar posts' })
  }
})

app.get('/api/posts/saved', verifyToken, async (req, res) => {
  try {
    const userId = req.userId

    // Busca posts onde o userId do usuário logado está presente no array 'savedBy'
    const posts = await postsCollection
      .find({ savedBy: userId })
      .sort({ createdAt: -1 })
      .toArray()

    const postsWithAuthor = await Promise.all(
      posts.map(async (post) => {
        const authorUser = await usersCollection.findOne({ _id: post.userId })

        return {
          ...serializePost(post),
          authorAvatar: authorUser?.avatar || null,
          is_saved: true,
        }
      }),
    )

    res.json(postsWithAuthor)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar posts salvos' })
  }
})

app.post('/api/posts/:postId/save', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.userId

    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Post inválido' })
    }

    const postObjectId = new ObjectId(postId)
    const post = await postsCollection.findOne({ _id: postObjectId })

    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' })
    }

    const savedBy = post.savedBy || []
    const isSaved = savedBy.includes(userId)

    if (isSaved) {
      await postsCollection.updateOne(
        { _id: postObjectId },
        { $pull: { savedBy: userId } },
      )
    } else {
      await postsCollection.updateOne(
        { _id: postObjectId },
        { $addToSet: { savedBy: userId } },
      )
    }

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

app.post('/api/posts', verifyToken, upload.single('image'), async (req, res) => {
  const { title, content } = req.body
  const categoriesInput = req.body.categories

  if (!title || !content) {
    return res.status(400).json({ message: 'Título e conteúdo são obrigatórios' })
  }

  try {
    let categories = []

    if (categoriesInput) {
      try {
        categories = JSON.parse(categoriesInput)
      } catch (_error) {
        categories = []
      }
    }

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

    await postsCollection.insertOne({
      userId,
      author: req.username,
      title,
      categories,
      content,
      image,
      attachments,
      savedBy: [],
      createdAt: new Date(),
    })

    res.status(201).json({ message: 'Post criado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar post' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, bio } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' })
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 8)

    await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      bio: bio || 'Olá! Estou usando o EduConnect.',
      createdAt: new Date(),
    })

    res.status(201).json({ message: 'Usuário registrado com sucesso' })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Usuário ou email já existe' })
    }

    res.status(500).json({ message: 'Erro ao registrar usuário' })
  }
})
//atualizar perfil de usuario logado
app.put('/api/users/me', verifyToken, upload.single('avatar'), async (req, res) => {
  const { username, bio } = req.body

  if (!username || !username.trim()) {
    return res.status(400).json({ message: 'Nome de usuário é obrigatório' })
  }

  try {
    const userId = new ObjectId(req.userId)
    const usernameLimpo = username.trim()
    const bioLimpa = bio?.trim() || ''

    const existingUser = await usersCollection.findOne({
      username: usernameLimpo,
      _id: { $ne: userId },
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Nome de usuário já está em uso' })
    }

    const oldUser = await usersCollection.findOne({ _id: userId })
    const avatar = req.file ? `/uploads/${req.file.filename}` : oldUser.avatar || null

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

    if (oldUser.username !== usernameLimpo) {
      await postsCollection.updateMany(
        { userId },
        { $set: { author: usernameLimpo } },
      )
    }

    const updatedUser = await usersCollection.findOne({ _id: userId })

    const token = jwt.sign(
      { id: updatedUser._id.toString(), username: updatedUser.username },
      JWT_SECRET,
      { expiresIn: '24h' },
    )

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: serializeUser(updatedUser),
      token,
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil' })
  }
})

// Search users by username (partial, case-insensitive)
app.get('/api/users/search', verifyToken, async (req, res) => {
  const { q } = req.query

  if (!q || q.trim().length === 0) {
    return res.json([])
  }

  try {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const users = await usersCollection
      .find({ username: { $regex: regex } })
      .project({ password: 0 })
      .limit(20)
      .toArray()

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

// Get user profile by username
app.get('/api/users/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params
    const user = await usersCollection.findOne({ username })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    res.json(serializeUser(user))
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil' })
  }
})

const startServer = async () => {
  try {
    await connectDatabase()

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
      console.log(`MongoDB connected using ${process.env.MONGODB_URI ? 'MONGODB_URI' : 'MongoMemoryServer'}`)
    })
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error)
    process.exit(1)
  }
}

startServer()
