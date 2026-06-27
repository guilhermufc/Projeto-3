// Importação do Router do Express e módulos para criptografia.
const { Router } = require('express')
const bcrypt = require('bcryptjs')
// Importa o acesso centralizado ao banco de dados.
const { getCollections } = require('../../config/database')
// Importa o serializador do usuário para filtrar campos no retorno das requisições.
const { serializeUser } = require('../../utils/serializers')

// Inicialização do roteador.
const router = Router()

/**
 * ROTA: POST /api/auth/login
 * DESCRIÇÃO: Autentica o usuário com nome de usuário e senha, devolvendo apenas os dados públicos do usuário.
 */
router.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body

  // Validação: Username e senha são obrigatórios na requisição
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios' })
  }

  try {
    // Obtém a coleção de usuários no MongoDB
    const { usersCollection } = getCollections()
    // Procura o usuário correspondente ao username recebido
    const user = await usersCollection.findOne({ username })

    // Se o usuário não existir no banco de dados, retorna erro de credenciais inválidas
    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' })
    }

    // Compara a senha fornecida com a senha criptografada armazenada no banco
    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' })
    }

    // Retorna os dados públicos do usuário autenticado para o frontend (sem gerar token JWT)
    res.json({
      user: serializeUser(user),
    })
  } catch (error) {
    // Retorna erro genérico de servidor em caso de falhas durante o processamento
    res.status(500).json({ message: 'Erro no servidor' })
  }
})

/**
 * ROTA: POST /api/auth/register
 * DESCRIÇÃO: Registra e cria uma nova conta de usuário. Criptografa a senha com bcrypt.
 */
router.post('/api/auth/register', async (req, res) => {
  const { username, email, password, bio } = req.body

  // Validação: Username, email e senha devem ser informados
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' })
  }

  try {
    const { usersCollection } = getCollections()
    // Criptografa a senha informada usando salt de 8 rounds
    const hashedPassword = bcrypt.hashSync(password, 8)

    // Insere o novo registro do usuário na coleção do banco de dados
    await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      bio: bio || 'Olá! Estou usando o EduConnect.', // Bio padrão caso o usuário não informe
      createdAt: new Date(),
    })

    // Retorna status 201 (Criado com Sucesso)
    res.status(201).json({ message: 'Usuário registrado com sucesso' })
  } catch (error) {
    // Código de erro 11000 no MongoDB representa violação de restrição única (ex: e-mail ou username já cadastrados)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Usuário ou email já existe' })
    }

    // Retorna erro interno caso ocorra outra falha
    res.status(500).json({ message: 'Erro ao registrar usuário' })
  }
})

module.exports = router
