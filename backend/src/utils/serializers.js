// Função utilitária para serializar os dados do usuário antes de enviá-los ao frontend.
// Remove dados sensíveis (como senha) e formata os campos necessários.
const serializeUser = (user) => ({
  id: user._id.toString(), // Converte o ObjectId do MongoDB para string.
  username: user.username,
  email: user.email,
  bio: user.bio || '', // Retorna string vazia caso a bio não exista.
  avatar: user.avatar || null, // Retorna null se não houver foto de perfil.
})

// Função utilitária para serializar dados de uma publicação (post).
const serializePost = (post) => ({
  id: post._id.toString(), // Converte o ObjectId da publicação para string.
  user_id: post.userId?.toString?.() || post.userId, // Garante que o ID do autor seja uma string.
  author: post.author,
  title: post.title,
  categories: post.categories || [], // Array de categorias ou lista vazia.
  content: post.content,
  image: post.image || null, // Link da imagem associada ou null.
  attachments: post.attachments || [], // Anexos adicionais.
  saved_count: post.savedBy?.length || 0, // Conta quantos usuários salvaram o post.
  created_at: post.createdAt || null, // Data de criação do post.
})

// Função utilitária para serializar dados de um agendamento do calendário.
const serializeSchedule = (schedule) => ({
  id: schedule._id.toString(), // Converte o ID do agendamento para string.
  user_id: schedule.userId?.toString?.() || schedule.userId, // ID do usuário associado.
  date: schedule.date, // Data do agendamento (AAAA-MM-DD).
  description: schedule.description, // Descrição/Texto do compromisso.
  done: Boolean(schedule.done), // Garante que seja um valor booleano (feito/pendente).
  created_at: schedule.createdAt || null,
  updated_at: schedule.updatedAt || null,
})

// Exporta as funções de serialização para serem usadas nas rotas.
module.exports = { serializeUser, serializePost, serializeSchedule }
