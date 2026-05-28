# EduConnect

Um aplicativo mobile-first para compartilhamento de conhecimento entre estudantes.

## Estrutura do Projeto

- **frontend/**: Aplicação React com Vite
- **backend/**: API Express.js
- **prototype html/**: Arquivos HTML originais dos protótipos

## Funcionalidades

### Tela de Login
- Autenticação de usuários
- Validação de credenciais
- Geração de JWT token

### Feed
- Listagem de posts em tempo real
- Filtro por categorias (Métodos, Leitura, Registro)
- Exibição de likes e visualizações
- Navegação inferior

### Criar Postagem
- Editor de texto
- Seleção de categoria
- Upload de imagens
- Compartilhamento de conteúdo

## Instalação e Execução

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Backend

1. Instale as dependências:
```bash
cd backend
npm install
```

2. Configure as variáveis de ambiente (opcional):
```bash
cp .env.example .env
```

3. Inicie o servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Credenciais de Teste

- **Usuário**: usuario123
- **Senha**: 123456

## Tecnologias Utilizadas

### Frontend
- React 19.0.0
- Vite 6.0.0
- Tailwind CSS 3.3.0
- React Router 6.24.0
- Axios 1.6.0

### Backend
- Express.js 4.21.2
- JWT (jsonwebtoken)
- bcryptjs para hash de senhas
- SQLite3 (banco de dados em memória)
- Multer para upload de arquivos

## Estrutura de Pastas

```
educonnect/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Feed.jsx
│   │   │   └── Post.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── backend/
│   ├── src/
│   │   └── server.js
│   └── package.json
└── prototype html/
    ├── login.html
    ├── feed.html
    └── post.html
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registrar novo usuário

### Posts
- `GET /api/posts` - Listar todos os posts
- `POST /api/posts` - Criar novo post (requer autenticação)

### Health Check
- `GET /api/health` - Verificar status do servidor

## Desenvolvimento

Para fazer alterações, certifique-se de:

1. O servidor backend está rodando na porta 3000
2. A aplicação frontend está rodando na porta 5173
3. As variáveis de ambiente estão configuradas corretamente

## Próximas Melhorias

- [ ] Persistência de dados em banco de dados real
- [ ] Sistema de comentários
- [ ] Notificações em tempo real
- [ ] Recurso de busca
- [ ] Perfil de usuário
- [ ] Sistema de seguim
- [ ] Dark mode
