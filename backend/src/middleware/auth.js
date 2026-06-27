/**
 * Middleware de autenticação simplificado (sem tokens JWT).
 * Identifica o usuário lendo o ID e o Username diretamente de cabeçalhos HTTP customizados.
 */
const verifyUser = (req, res, next) => {
  // Lê o ID e Username enviados pelo frontend nos cabeçalhos da requisição
  const userId = req.headers['x-user-id']
  const username = req.headers['x-user-username']

  // Se o ID do usuário não for fornecido, recusa o acesso com status 401 (Não Autorizado)
  if (!userId) {
    return res.status(401).json({ message: 'Sessão inválida. ID do usuário não fornecido.' })
  }

  // Define os dados do usuário logado na requisição para que as rotas possam utilizá-los
  req.userId = userId
  req.username = username || 'usuario'
  
  // Prossegue para a rota solicitada
  next()
}

module.exports = { verifyUser }
