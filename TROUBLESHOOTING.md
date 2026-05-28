# 🔧 Troubleshooting - Resolvendo Problemas

## ❌ Erro: "Port 3000 is already in use"

**Solução:**
1. Encontre qual processo está usando a porta:
```bash
# macOS/Linux
lsof -i :3000
# Windows
netstat -ano | findstr :3000
```

2. Mate o processo ou mude a porta:
```bash
# Mudar porta no backend - edite backend/src/server.js
const port = process.env.PORT || 3001  // Mude para 3001
```

---

## ❌ Erro: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solução:**
1. Certifique-se de que o frontend está na porta correta: `http://localhost:5173`
2. Verifique se o backend está permitindo essa origem
3. Confirme que ambos os servidores estão rodando

---

## ❌ Erro: "Cannot find module 'express'"

**Solução:**
```bash
cd backend
npm install
```

---

## ❌ Erro: "Cannot find module 'react-router-dom'"

**Solução:**
```bash
cd frontend
npm install
```

---

## ❌ Erro: "Login falha com mensagem 'Usuário ou senha inválidos'"

**Solução:**
1. Verificar as credenciais padrão:
   - Usuário: `usuario123`
   - Senha: `123456`

2. Se quiser adicionar novo usuário, faça login primeiro e depois registre

---

## ❌ Erro: "Cannot POST /api/posts"

**Solução:**
1. Certifique-se de que enviou o token JWT correto:
```javascript
headers: {
  Authorization: `Bearer ${token}`
}
```

2. Verifique se o token não expirou (validade de 24h)

---

## ❌ Imagens não aparecem no post

**Solução:**
1. Verifique se o arquivo de imagem está em um formato suportado
2. Certifique-se de que a pasta `uploads/` existe no backend
3. Se necessário, crie a pasta:
```bash
mkdir backend/uploads
```

---

## ❌ Erro: "Tailwind CSS classes not working"

**Solução:**
1. Certifique-se de que o build do Tailwind foi executado:
```bash
cd frontend
npm run dev  # Isso deve compilar o Tailwind
```

2. Limpe o cache:
```bash
rm -rf frontend/node_modules/.vite
npm run dev
```

---

## ❌ Erro: "Cannot connect to backend"

**Verificar:**
1. Backend está rodando?
```bash
# Terminal 1
cd backend
npm run dev
# Deve aparecer: Server running on http://localhost:3000
```

2. Frontend pode acessar a API?
```bash
curl http://localhost:3000/api/health
# Deve retornar: {"ok":true}
```

3. Portas corretas:
   - Backend: 3000
   - Frontend: 5173

---

## ❌ Erro de Token Expirado

**Solução:**
1. Faça logout e login novamente
2. O token expira em 24h (pode ser alterado em `backend/src/server.js`)

---

## ❌ Dados não persistem após reiniciar

**Por quê:**
O banco de dados está em memória (`:memory:`). Dados são perdidos ao desligar o servidor.

**Solução futura:**
Implementar banco de dados persistente como PostgreSQL ou MySQL.

---

## ✅ Tudo funcionando!

Se após seguir essas soluções o projeto ainda tiver problemas:

1. Verifique se Node.js 16+ está instalado:
```bash
node --version  # Deve ser v16 ou superior
```

2. Reinstale as dependências:
```bash
rm -rf frontend/node_modules backend/node_modules
bash setup.sh
```

3. Reinicie ambos os servidores

---

## 📝 Logs úteis

**Backend - Ativar modo debug:**
```bash
DEBUG=* npm run dev
```

**Frontend - Abrir DevTools:**
- F12 ou Cmd+Option+I
- Vá para aba "Console" para ver erros

---

## 🆘 Nada funcionou?

1. Verifique se o arquivo `.env` está correto (se você criou um)
2. Tente em uma nova sessão do terminal
3. Verifique se há firewalls bloqueando as portas
4. Consulte a documentação do README.md
