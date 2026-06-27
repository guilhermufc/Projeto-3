// Importações do express, MongoDB, conexões e serializadores.
const { Router } = require('express')
const { ObjectId } = require('mongodb')
const { getCollections } = require('../../config/database')
const { serializeSchedule } = require('../../utils/serializers')
const { verifyUser } = require('../../middleware/auth')

// Inicialização do roteador.
const router = Router()

/**
 * ROTA: GET /api/schedules
 * DESCRIÇÃO: Busca os compromissos agendados no calendário do usuário logado.
 * Aceita filtro por 'month' (formato: AAAA-MM) para retornar apenas os dias daquele mês.
 */
router.get('/api/schedules', verifyUser, async (req, res) => {
  try {
    const { schedulesCollection } = getCollections()
    const { month } = req.query
    const userId = new ObjectId(req.userId)

    const filter = { userId }

    // Aplica o filtro de data para obter os dias entre 01 e 31 do mês selecionado
    if (month) {
      filter.date = {
        $gte: `${month}-01`,
        $lte: `${month}-31`,
      }
    }

    // Retorna a agenda do usuário ordenada por data e horário de criação
    const schedules = await schedulesCollection
      .find(filter)
      .sort({ date: 1, createdAt: 1 })
      .toArray()

    // Envia os registros mapeados pelo serializador de compromissos
    res.json(schedules.map(serializeSchedule))
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agenda' })
  }
})

/**
 * ROTA: POST /api/schedules
 * DESCRIÇÃO: Cria uma nova programação/compromisso na agenda.
 */
router.post('/api/schedules', verifyUser, async (req, res) => {
  const { date, description } = req.body

  // Validação: Data e descrição textual do compromisso são necessários
  if (!date || !description || !description.trim()) {
    return res.status(400).json({ message: 'Data e descrição são obrigatórias' })
  }

  try {
    const { schedulesCollection } = getCollections()

    // Insere o compromisso no banco vinculando ao ID do usuário autenticado
    const result = await schedulesCollection.insertOne({
      userId: new ObjectId(req.userId),
      date,
      description: description.trim(),
      done: false, // Inicia como tarefa/compromisso pendente
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Recupera o documento criado para retornar ao frontend
    const createdSchedule = await schedulesCollection.findOne({
      _id: result.insertedId,
    })

    res.status(201).json(serializeSchedule(createdSchedule))
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar agenda' })
  }
})

/**
 * ROTA: PUT /api/schedules/:scheduleId
 * DESCRIÇÃO: Edita ou atualiza as propriedades de um compromisso (marcar como feito, editar texto ou alterar a data).
 */
router.put('/api/schedules/:scheduleId', verifyUser, async (req, res) => {
  const { scheduleId } = req.params
  const { date, description, done } = req.body

  // Validação do ID
  if (!ObjectId.isValid(scheduleId)) {
    return res.status(400).json({ message: 'Agenda inválida' })
  }

  try {
    const { schedulesCollection } = getCollections()
    const userId = new ObjectId(req.userId)
    const scheduleObjectId = new ObjectId(scheduleId)

    const update = {
      updatedAt: new Date(), // Define a data da última modificação
    }

    // Insere apenas as propriedades enviadas na requisição de atualização
    if (date) update.date = date
    if (typeof description === 'string') update.description = description.trim()
    if (typeof done === 'boolean') update.done = done

    // Realiza a atualização garantindo que o compromisso pertence ao usuário que enviou a requisição
    await schedulesCollection.updateOne(
      {
        _id: scheduleObjectId,
        userId,
      },
      {
        $set: update,
      },
    )

    // Busca o documento atualizado
    const updatedSchedule = await schedulesCollection.findOne({
      _id: scheduleObjectId,
      userId,
    })

    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Agenda não encontrada' })
    }

    res.json(serializeSchedule(updatedSchedule))
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agenda' })
  }
})

/**
 * ROTA: DELETE /api/schedules/:scheduleId
 * DESCRIÇÃO: Apaga definitivamente um compromisso do calendário.
 */
router.delete('/api/schedules/:scheduleId', verifyUser, async (req, res) => {
  const { scheduleId } = req.params

  if (!ObjectId.isValid(scheduleId)) {
    return res.status(400).json({ message: 'Agenda inválida' })
  }

  try {
    const { schedulesCollection } = getCollections()

    // Deleta o registro garantindo que o ID do agendamento pertença ao usuário ativo
    const result = await schedulesCollection.deleteOne({
      _id: new ObjectId(scheduleId),
      userId: new ObjectId(req.userId),
    })

    // Se nenhum registro foi afetado, significa que o ID não existe ou pertence a outro usuário
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Agenda não encontrada' })
    }

    res.json({ message: 'Agenda apagada com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar agenda' })
  }
})

module.exports = router
