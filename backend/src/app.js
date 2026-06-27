// Importa o framework Express para gerenciar rotas, middlewares e requisições HTTP.
const express = require('express')
// Importa o middleware CORS para gerenciar permissões de acesso da API de diferentes domínios.
const cors = require('cors')
// Importa o caminho da pasta de uploads de arquivos.
const { uploadDir } = require('./middleware/upload')

// Importação dos módulos de rota reorganizados por funcionalidade
const healthRoutes = require('./modules/health/health.routes')
const authRoutes = require('./modules/auth/auth.routes')
const postsRoutes = require('./modules/posts/posts.routes')
const schedulesRoutes = require('./modules/schedules/schedules.routes')
const usersRoutes = require('./modules/users/users.routes')

// Inicializa a aplicação Express.
const app = express()

// Define a origem permitida para conexão com o frontend (lida do .env ou padrão localhost:5173)
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'

// Habilita o parseamento de corpos de requisições em formato JSON de forma global.
app.use(express.json())

// Configura o middleware CORS para permitir requisições originárias do domínio do frontend.
app.use(
  cors({
    origin: [allowedOrigin, 'http://localhost:5173'],
  }),
)

// Torna a pasta 'uploads' pública e acessível estaticamente pela rota /uploads.
// Isso permite que o frontend acesse diretamente as imagens de avatar e de posts (ex: http://localhost:3000/uploads/imagem.png).
app.use('/uploads', express.static(uploadDir))

// Registra todos os módulos de rota na aplicação.
app.use(healthRoutes)
app.use(authRoutes)
app.use(postsRoutes)
app.use(schedulesRoutes)
app.use(usersRoutes)

// Exporta o aplicativo configurado.
module.exports = app
