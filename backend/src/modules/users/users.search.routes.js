// Importações de dependências básicas, MongoDB e middlewares.
const { Router } = require('express') // Importa o Router do Express para criar rotas.
const { getCollections } = require('../../config/database') // Importa a função para obter as coleções do MongoDB.
const { verifyUser } = require('../../middleware/auth') // Importa o middleware de autenticação para verificar o token JWT.

// Inicialização do roteador.
const router = Router() // Cria uma nova instância do roteador do Express.

/**
 * ROTA: GET /api/users/search
 * DESCRIÇÃO: Pesquisa de usuários cadastrados por correspondência parcial no username (case-insensitive).
 */
router.get('/api/users/search', verifyUser, async (req, res) => { // Define uma rota GET para '/api/users/search' com middleware de autenticação.
  const { q } = req.query // Extrai o termo de busca 'q' da query string da requisição.

  // Retorna um array vazio se o termo de busca não for enviado ou for em branco
  if (!q || q.trim().length === 0) { // Verifica se o termo de busca 'q' não foi fornecido ou está vazio.
    return res.json([]) // Retorna um array vazio se não houver termo de busca válido.
  }

  try {
    const { usersCollection } = getCollections() // Obtém a coleção 'users' do banco de dados.
    // Escapa caracteres especiais do RegExp para evitar ataques de injeção de expressão regular
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') // Cria uma expressão regular para busca case-insensitive, escapando caracteres especiais.
    
    // Faz a consulta retornando os usuários com correspondência no nome, ocultando as senhas por segurança
    const users = await usersCollection // Inicia a consulta na coleção de usuários.
      .find({ username: { $regex: regex } }) // Encontra usuários onde o 'username' corresponde à expressão regular.
      .project({ password: 0 }) // Exclui o campo 'password' do resultado por segurança.
      .limit(20) // Limita o número de resultados retornados a 20.
      .toArray() // Converte o cursor de resultados para um array.

    // Retorna os dados mapeados para o formato seguro esperado pelo frontend
    res.json( // Retorna uma resposta JSON.
      users.map((u) => ({ // Mapeia cada usuário encontrado para um novo objeto.
        id: u._id.toString(), // Converte o ObjectId '_id' para string e o define como 'id'.
        username: u.username, // Inclui o nome de usuário.
        email: u.email, // Inclui o email.
        avatar: u.avatar || null, // Inclui o caminho do avatar, ou null se não houver.
      })),
    )
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' }) // Em caso de erro, retorna um status 500 com uma mensagem de erro.
  }
})

module.exports = router // Exporta o roteador para ser usado em outros arquivos da aplicação.
