// Importa a aplicação express configurada no arquivo app.js.
const app = require('./app')
// Importa o método de conexão com o banco de dados.
const { connectDatabase } = require('./config/database')
require('dotenv').config()

// Define a porta do servidor obtida do arquivo .env ou a porta padrão 3000.
const port = process.env.PORT || 3000

/**
 * Função de inicialização assíncrona do servidor backend.
 */
const startServer = async () => {
  try {
    // Primeiro tenta conectar ao banco de dados MongoDB (real ou em memória)
    await connectDatabase()

    // Com o banco conectado com sucesso, inicia o servidor Express para ouvir requisições na porta especificada
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
      console.log(`MongoDB connected using ${process.env.MONGODB_URI ? 'MONGODB_URI' : 'MongoMemoryServer'}`)
    })
  } catch (error) {
    // Caso ocorra qualquer erro na inicialização (conexão ou inicialização de servidor), loga o erro e encerra o processo
    console.error('Erro ao iniciar o servidor:', error)
    process.exit(1)
  }
}

// Executa a função para iniciar o servidor do aplicativo.
startServer()
