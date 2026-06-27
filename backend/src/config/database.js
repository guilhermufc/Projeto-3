// Importação de dependências necessárias para segurança e conexão com banco de dados.
const bcrypt = require('bcryptjs')
const { MongoClient } = require('mongodb')
const { MongoMemoryServer } = require('mongodb-memory-server') // Banco em memória usado para desenvolvimento/testes locais.
require('dotenv').config()

let mongoClient
let mongoMemoryServer
let usersCollection
let postsCollection
let schedulesCollection

/**
 * Retorna as referências das coleções do banco de dados ativas.
 * Facilita o acesso às collections a partir dos arquivos de rotas/módulos.
 */
const getCollections = () => ({
  usersCollection,
  postsCollection,
  schedulesCollection,
})

/**
 * Recria o banco de dados com dados fictícios padrão (seed) toda vez que o servidor inicia.
 * Ideal para manter o ambiente de testes consistente.
 */
const resetDatabaseWithDefaultAdmin = async () => {
  // Dados do usuário Administrador padrão
  const defaultAdmin = {
    username: 'admin',
    email: 'admin@educonnect.local',
    password: bcrypt.hashSync('admin', 8), // Criptografa a senha "admin" antes de salvar
    bio: 'Amo ensinar pessoas.',
    createdAt: new Date(),
  }

  // Dados do usuário Maria padrão
  const userMaria = {
    username: 'mariasilva',
    email: 'maria@educonnect.local',
    password: bcrypt.hashSync('maria123', 8), // Senha criptografada "maria123"
    bio: 'Professora de Língua Portuguesa apaixonada por leitura e escrita.',
    createdAt: new Date(),
  }

  // Dados do usuário João padrão
  const userJoao = {
    username: 'joaosouza',
    email: 'joao@educonnect.local',
    password: bcrypt.hashSync('joao123', 8), // Senha criptografada "joao123"
    bio: 'Estudante de engenharia e entusiasta de tecnologia.',
    createdAt: new Date(),
  }

  // Limpa as coleções de posts e usuários para evitar duplicidades
  await postsCollection.deleteMany({})
  await usersCollection.deleteMany({})

  // Insere os usuários padrão e obtém os IDs gerados pelo MongoDB
  const usersResult = await usersCollection.insertMany([defaultAdmin, userMaria, userJoao])
  const adminId = usersResult.insertedIds[0]
  const mariaId = usersResult.insertedIds[1]
  const joaoId = usersResult.insertedIds[2]

  // Lista de publicações (posts) para popular o banco de dados
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
      createdAt: new Date(Date.now() - 3600000 * 2), // Publicado há 2 horas
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
      createdAt: new Date(Date.now() - 3600000 * 5), // Publicado há 5 horas
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
      createdAt: new Date(Date.now() - 3600000 * 10), // Publicado há 10 horas
    }
  ]

  // Insere os posts no banco de dados
  await postsCollection.insertMany(seedPosts)
}

/**
 * Conecta ao banco de dados MongoDB real (via MONGODB_URI do .env) ou cria
 * um servidor MongoDB em memória caso não haja uma URI de produção configurada.
 */
const connectDatabase = async () => {
  const connectionString = process.env.MONGODB_URI
  let effectiveUri = connectionString

  // Se nenhuma URI do MongoDB for definida no .env, inicia um MongoDB em memória para testes temporários
  if (!effectiveUri) {
    mongoMemoryServer = await MongoMemoryServer.create()
    effectiveUri = mongoMemoryServer.getUri()
  }

  // Cria a conexão com o MongoDB
  mongoClient = new MongoClient(effectiveUri)
  await mongoClient.connect()

  // Define o banco de dados e as coleções a serem utilizadas
  const databaseName = process.env.MONGODB_DB_NAME || 'educonnect'
  const database = mongoClient.db(databaseName)
  usersCollection = database.collection('users')
  postsCollection = database.collection('posts')
  schedulesCollection = database.collection('schedules')

  // Cria índices únicos no MongoDB para garantir e-mails e usernames duplicados sejam rejeitados
  await usersCollection.createIndex({ username: 1 }, { unique: true })
  await usersCollection.createIndex({ email: 1 }, { unique: true })
  // Cria índice ordenado para otimizar a busca por data de criação das publicações
  await postsCollection.createIndex({ createdAt: -1 })
  // Cria índice composto para acelerar a pesquisa de agenda por usuário e data
  await schedulesCollection.createIndex({ userId: 1, date: 1 })

  // Inicializa o banco com dados fictícios para fins de testes rápidos
  await resetDatabaseWithDefaultAdmin()
}

module.exports = { connectDatabase, getCollections }
