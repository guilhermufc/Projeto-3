# 🏗️ Arquitetura do Projeto EduConnect

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        EDUCONNECT                          │
│                    EduConnect Platform                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐              ┌──────────────────────┐
│   FRONTEND (React)   │              │   BACKEND (Express)  │
├──────────────────────┤              ├──────────────────────┤
│ • Vite              │◄───HTTP/REST──►│ • API Routes        │
│ • React Router      │              │ • Auth JWT          │
│ • Tailwind CSS      │              │ • SQLite DB         │
│ • Axios             │              │ • Multer Upload     │
│ • Material Icons    │              │ • Bcryptjs          │
└──────────────────────┘              └──────────────────────┘
  Port: 5173                           Port: 3000
```

---

## 🔄 Fluxo de Dados

```
┌────────────────────────────────────────────────────────┐
│                    USUÁRIO                             │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ Abre app
                     ↓
         ┌──────────────────────┐
         │   Tela de Login      │
         │ (Login.jsx)          │
         │                      │
         │ 1. Digita credenciais│
         │ 2. Clica "Entrar"    │
         │ 3. HTTP POST /login  │
         └──────────┬───────────┘
                    │
                    │ Envia (username, password)
                    ↓
         ┌──────────────────────┐
         │  Backend /api/auth   │
         │  /login              │
         │                      │
         │ 1. Valida user/pass  │
         │ 2. Criptografa senha │
         │ 3. Gera JWT token    │
         │ 4. Retorna token     │
         └──────────┬───────────┘
                    │
                    │ Retorna token
                    ↓
         ┌──────────────────────┐
         │  Frontend Storage    │
         │  localStorage.setItem│
         │  ('token', ...)      │
         └──────────┬───────────┘
                    │
                    │ Redireciona
                    ↓
         ┌──────────────────────┐
         │   Tela de Feed       │
         │ (Feed.jsx)           │
         │                      │
         │ 1. Recupera token    │
         │ 2. HTTP GET /posts   │
         │ 3. Com auth header   │
         │ 4. Lista posts       │
         └──────────┬───────────┘
                    │
                    │ Requer autenticação
                    ↓
         ┌──────────────────────┐
         │ Backend /api/posts   │
         │                      │
         │ 1. Verifica token    │
         │ 2. Busca posts no DB │
         │ 3. Retorna JSON      │
         └──────────┬───────────┘
                    │
                    │ Retorna posts
                    ↓
         ┌──────────────────────┐
         │  Display Posts       │
         │  com likes/views     │
         └──────────┬───────────┘
                    │
                    │ Clica botão +
                    ↓
         ┌──────────────────────┐
         │  Tela Criar Post     │
         │ (Post.jsx)           │
         │                      │
         │ 1. Seleciona cat     │
         │ 2. Digita conteúdo   │
         │ 3. Seleciona imagem  │
         │ 4. Clica "Postar"    │
         │ 5. HTTP POST /posts  │
         └──────────┬───────────┘
                    │
                    │ Envia (content, category, image)
                    ↓
         ┌──────────────────────┐
         │ Backend /api/posts   │
         │ CREATE               │
         │                      │
         │ 1. Valida conteúdo   │
         │ 2. Salva imagem      │
         │ 3. Insere no DB      │
         │ 4. Retorna sucesso   │
         └──────────┬───────────┘
                    │
                    │ Sucesso
                    ↓
         ┌──────────────────────┐
         │  Volta ao Feed       │
         │  Novo post aparece   │
         └──────────────────────┘
```

---

## 📦 Estrutura de Pastas

```
Frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx          (Autenticação)
│   │   ├── Feed.jsx           (Listagem)
│   │   └── Post.jsx           (Criar)
│   ├── App.jsx                (Rotas)
│   ├── main.jsx               (Entry point)
│   └── index.css              (Estilos globais)
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json

Backend/
├── src/
│   └── server.js              (API)
├── uploads/                   (Imagens)
└── package.json
```

---

## 🗄️ Banco de Dados

```
             SQLite (Em Memória)
                    │
        ┌───────────┴───────────┐
        │                       │
    ┌───▼────┐            ┌────▼──┐
    │ Users  │            │ Posts │
    ├────────┤            ├───────┤
    │ id     │            │ id    │
    │username│            │userid │
    │password│            │author │
    │email   │            │content│
    │created │            │catego │
    └────────┘            │image  │
                          │likes  │
                          │views  │
                          │created│
                          └───────┘
```

---

## 🔐 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────┐
│             AUTENTICAÇÃO JWT                         │
└─────────────────────────────────────────────────────┘

1. USUÁRIO FAZE LOGIN
   ┌──────────────┐
   │ POST /login  │
   │ user: ...    │
   │ pass: ...    │
   └──────────────┘

2. BACKEND VALIDA
   ┌──────────────────────────┐
   │ SELECT * FROM users      │
   │ WHERE username = ?       │
   └──────────────────────────┘

3. COMPARA SENHAS
   ┌──────────────────────────┐
   │ bcrypt.compare(          │
   │   inputPassword,         │
   │   storedHash             │
   │ )                        │
   └──────────────────────────┘

4. GERA JWT TOKEN
   ┌──────────────────────────┐
   │ jwt.sign({               │
   │   id: user.id,           │
   │   username: user.name    │
   │ },                       │
   │   JWT_SECRET,            │
   │   { expiresIn: '24h' }   │
   │ )                        │
   └──────────────────────────┘

5. RETORNA TOKEN
   ┌────────────────────────┐
   │ { token: "abc123..." } │
   └────────────────────────┘

6. FRONTEND ARMAZENA
   ┌────────────────────────┐
   │ localStorage.setItem(  │
   │   'token',             │
   │   'abc123...'          │
   │ )                      │
   └────────────────────────┘

7. REQUISIÇÃO COM TOKEN
   ┌────────────────────────┐
   │ GET /posts             │
   │ Headers: {             │
   │   Authorization:       │
   │   "Bearer abc123..."   │
   │ }                      │
   └────────────────────────┘

8. MIDDLEWARE VERIFICA
   ┌────────────────────────┐
   │ jwt.verify(            │
   │   token,               │
   │   JWT_SECRET           │
   │ )                      │
   └────────────────────────┘

9. RETORNA DADOS
   ┌────────────────────────┐
   │ [                      │
   │   { id: 1, ... },      │
   │   { id: 2, ... }       │
   │ ]                      │
   └────────────────────────┘
```

---

## 🔄 Ciclo de Vida de um Post

```
1. CRIAR POST
   ┌─────────────────────┐
   │ Form do usuário     │
   │ - Categoria         │
   │ - Conteúdo          │
   │ - Imagem (opt)      │
   └────────────┬────────┘
                │
2. VALIDAR
   ┌─────────────────────┐
   │ • Conteúdo obrig?   │
   │ • Imagem válida?    │
   │ • Tamanho OK?       │
   └────────────┬────────┘
                │
3. PROCESSAR
   ┌─────────────────────┐
   │ • Salvar imagem     │
   │ • Gerar URL         │
   │ • Preparar dados    │
   └────────────┬────────┘
                │
4. ARMAZENAR
   ┌─────────────────────┐
   │ INSERT INTO posts   │
   │ (user_id, author,   │
   │  content,...)       │
   └────────────┬────────┘
                │
5. RETORNAR
   ┌─────────────────────┐
   │ { sucesso: true }   │
   └────────────┬────────┘
                │
6. ATUALIZAR UI
   ┌─────────────────────┐
   │ • Voltar ao feed    │
   │ • Mostrar novo post │
   │ • Limpar form       │
   └────────────┬────────┘
                │
7. EXIBIR
   ┌─────────────────────┐
   │ GET /posts          │
   │ └─ Nova query       │
   │ └─ Novo post no topo│
   └─────────────────────┘
```

---

## 🌐 Endpoints da API

```
┌──────────────────────────────────────────────────┐
│         ROTAS DE AUTENTICAÇÃO                    │
├──────────────────────────────────────────────────┤
│ POST /api/auth/login          Login de usuário   │
│ POST /api/auth/register       Criar conta        │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│         ROTAS DE POSTS                           │
├──────────────────────────────────────────────────┤
│ GET  /api/posts               Listar posts       │
│ POST /api/posts               Criar post         │
│ (GET /api/posts/:id)          Detalhe (futuro)  │
│ (PUT /api/posts/:id)          Editar (futuro)   │
│ (DELETE /api/posts/:id)       Deletar (futuro)  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│         ROTAS UTILITÁRIAS                        │
├──────────────────────────────────────────────────┤
│ GET  /api/health              Verificar servidor│
└──────────────────────────────────────────────────┘
```

---

## 🎨 Fluxo de UI/UX

```
START
  │
  ├─► App.jsx
  │    │
  │    ├─► Verifica token
  │    │    │
  │    │    ├─ Sim: vai para /feed
  │    │    └─ Não: vai para /login
  │    │
  │    ├─► <BrowserRouter>
  │    │    │
  │    │    └─► <Routes>
  │    │        │
  │    │        ├─► /login → Login.jsx
  │    │        ├─► /feed  → Feed.jsx
  │    │        └─► /post  → Post.jsx
  │    │
  │    └─► Renderiza componente
  │
  └─► Usuário interage
      │
      ├─ Faz login
      │  └─► Salva token
      │  └─► Redireciona
      │
      ├─ Ve feed
      │  └─► Filtra categorias
      │  └─► Clica +
      │
      ├─ Cria post
      │  └─► Envia para API
      │  └─► Volta ao feed
      │
      └─ Faz logout
         └─► Remove token
         └─► Vai para login
```

---

## 🚀 Deploy Futuro

```
┌──────────────────────────────────────────┐
│           PRODUÇÃO (Futuro)               │
├──────────────────────────────────────────┤
│                                          │
│  CDN (Vercel)  ◄─ Frontend Build        │
│                                          │
│  Cloud (Heroku) ◄─ Backend Node         │
│                                          │
│  Database (PostgreSQL) ◄─ SQLite        │
│                                          │
│  Storage (S3) ◄─ Imagens (Multer)       │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📊 Resumo da Arquitetura

| Camada | Tecnologia | Responsabilidade |
|--------|-----------|------------------|
| Apresentação | React/Vite | Interface do usuário |
| Roteamento | React Router | Navegação entre telas |
| Estilos | Tailwind CSS | Design e responsividade |
| Requisições | Axios | HTTP client |
| Backend | Express.js | API REST |
| Autenticação | JWT | Segurança |
| Criptografia | Bcryptjs | Senhas |
| Database | SQLite | Dados |
| Upload | Multer | Arquivos |

---

## ✅ Checklist Arquitetural

- [x] Frontend separado do backend
- [x] API RESTful
- [x] Autenticação JWT
- [x] Proteção de rotas
- [x] Validação de entrada
- [x] Error handling
- [x] CORS configurado
- [x] Componentes React reutilizáveis
- [x] Estilos centralizados (Tailwind)
- [x] Banco de dados estruturado

---

*Arquitetura documentada em 27 de maio de 2026*
