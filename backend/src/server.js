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
const upload = multer({ dest: uploadDir })

let mongoClient
let mongoMemoryServer
let usersCollection
let postsCollection

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
})

const serializePost = (post) => ({
  id: post._id.toString(),
  user_id: post.userId?.toString?.() || post.userId,
  author: post.author,
  content: post.content,
  image: post.image || null,
  likes: post.likes || 0,
  views: post.views || 0,
  created_at: post.createdAt || null,
})

const seedDatabase = async () => {
  await postsCollection.deleteMany({})
  await usersCollection.deleteMany({})
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

  await usersCollection.createIndex({ username: 1 }, { unique: true })
  await usersCollection.createIndex({ email: 1 }, { unique: true })
  await postsCollection.createIndex({ createdAt: -1 })

  await seedDatabase()
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

app.get('/api/posts', verifyToken, async (_req, res) => {
  try {
    const posts = await postsCollection.find({}).sort({ createdAt: -1 }).toArray()
    res.json(posts.map(serializePost))
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar posts' })
  }
})

app.post('/api/posts', verifyToken, upload.single('image'), async (req, res) => {
  const { content } = req.body

  if (!content) {
    return res.status(400).json({ message: 'Conteúdo é obrigatório' })
  }

  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null
    const userId = new ObjectId(req.userId)

    await postsCollection.insertOne({
      userId,
      author: req.username,
      content,
      image: imageUrl,
      likes: 0,
      views: 0,
      createdAt: new Date(),
    })

    res.status(201).json({ message: 'Post criado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar post' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' })
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 8)

    await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
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
