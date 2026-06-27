// Importação do recurso Router do Express para criar as rotas do aplicativo de forma isolada.
const { Router } = require('express')

// Inicialização do roteador para este módulo.
const router = Router()

/**
 * ROTA: GET /api/health
 * DESCRIÇÃO: Endpoint de monitoramento de saúde do aplicativo.
 * Usado para testar se a API e a conectividade com o MongoDB estão online.
 */
router.get('/api/health', (_req, res) => {
  // Retorna uma resposta JSON informando que o servidor está ativo (ok: true)
  res.json({ ok: true, database: 'mongodb' })
})

// Exporta o roteador para ser registrado na aplicação principal.
module.exports = router
