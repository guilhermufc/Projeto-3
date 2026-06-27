import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post as apiPost, put, del, fetchExternal } from '../services/api'
import '../styles/Calendar.css' // Importa estilos customizados da tela de Calendário (CSS vanilla)

// Nomes dos meses em português
const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

// Abreviações dos dias da semana
const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// Converte uma instância de Date para string do tipo AAAA-MM-DD
function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Converte string AAAA-MM-DD para o formato brasileiro DD/MM/AAAA
function formatDatePt(dateKey) {
  const [year, month, day] = dateKey.split('-')
  return `${day}/${month}/${year}`
}

// Retorna a chave do mês no formato AAAA-MM
function getMonthKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

// Gera a matriz com os 35 dias a serem exibidos no calendário
function getCalendarDays(currentDate) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startDay = firstDayOfMonth.getDay()

  // Define o ponto de partida na grade (pode ser o fim do mês anterior)
  const firstDayGrid = new Date(year, month, 1 - startDay)

  const days = []

  for (let i = 0; i < 35; i++) {
    const date = new Date(firstDayGrid)
    date.setDate(firstDayGrid.getDate() + i)

    days.push({
      date,
      dateKey: formatDateKey(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    })
  }

  return days
}

export default function Calendar() {
  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()))
  const [items, setItems] = useState([])
  const [holidays, setHolidays] = useState([])
  const [description, setDescription] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(false)

  const monthKey = getMonthKey(currentDate)
  const year = currentDate.getFullYear()

  // Memoiza a matriz de dias para evitar novos cálculos desnecessários no render
  const days = useMemo(() => getCalendarDays(currentDate), [currentDate])

  // Filtra as tarefas e feriados do dia selecionado
  const selectedItems = items.filter((item) => item.date === selectedDate)
  const selectedHoliday = holidays.find(
    (holiday) => holiday.date === selectedDate
  )  
  const todayKey = formatDateKey(new Date())

  // Busca a agenda do mês selecionado toda vez que o mês muda
  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      navigate('/login')
      return
    }

    fetchSchedule()
  }, [monthKey, navigate])

  // Busca feriados nacionais daquele ano
  useEffect(() => {
    fetchHolidays()
  }, [year])

  // Busca compromissos do usuário logado no backend
  async function fetchSchedule() {
    try {
      setLoading(true)

      const data = await get('/api/schedules', {
        params: { month: monthKey },
      })

      setItems(data || [])
    } catch (error) {
      console.error('Erro ao buscar agenda:', error)

      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Consome API externa de feriados nacionais do Brasil
  async function fetchHolidays() {
    try {
      const data = await fetchExternal(
        `https://brasilapi.com.br/api/feriados/v1/${year}`
      )

      setHolidays(data || [])
    } catch (error) {
      console.error('Erro ao buscar feriados:', error)
      setHolidays([])
    }
  }

  // Volta um mês no calendário
  function previousMonth() {
    setCurrentDate((current) => {
      const newDate = new Date(current)
      newDate.setMonth(current.getMonth() - 1)
      return newDate
    })
  }

  // Avança um mês no calendário
  function nextMonth() {
    setCurrentDate((current) => {
      const newDate = new Date(current)
      newDate.setMonth(current.getMonth() + 1)
      return newDate
    })
  }

  // Trata a seleção de um dia no calendário
  function selectDay(day) {
    setSelectedDate(day.dateKey)
    setEditingItem(null)
    setDescription('')
  }

  // Inicia edição de um compromisso populando a caixa de texto
  function startEditing(item) {
    setEditingItem(item)
    setDescription(item.description)
  }

  // Salva ou atualiza um compromisso
  async function saveSchedule() {
    if (!description.trim()) {
      alert('Digite uma descrição para a agenda.')
      return
    }

    try {
      if (editingItem) {
        // Envia requisição PUT para salvar as alterações do compromisso
        const data = await put(
          `/api/schedules/${editingItem.id}`,
          {
            description,
            date: selectedDate,
          },
        )

        // Atualiza a lista local com os dados modificados
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === editingItem.id ? data : item,
          ),
        )
      } else {
        // Envia requisição POST para registrar novo compromisso
        const data = await apiPost(
          '/api/schedules',
          {
            date: selectedDate,
            description,
          },
        )

        setItems((currentItems) => [...currentItems, data])
      }

      setDescription('')
      setEditingItem(null)
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao salvar agenda')
    }
  }

  // Marca um compromisso como Concluído / Desfazer conclusão
  async function toggleDone(item) {
    try {
      const data = await put(
        `/api/schedules/${item.id}`,
        {
          done: !item.done,
        },
      )

      setItems((currentItems) =>
        currentItems.map((scheduleItem) =>
          scheduleItem.id === item.id ? data : scheduleItem,
        ),
      )
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao atualizar item')
    }
  }

  // Apaga compromisso do banco de dados
  async function deleteSchedule(itemId) {
    try {
      await del(`/api/schedules/${itemId}`)

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId),
      )

      setEditingItem(null)
      setDescription('')
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao apagar item')
    }
  }

  return (
    <div className="calendar-container">
      <div className="calendar-grid">
        
        {/* Coluna da esquerda (Cabeçalho e Calendário) */}
        <div className="calendar-col-left">
          
          <div className="calendar-title-box">
            <div className="calendar-title-card">
              <h1>Programação para:</h1>
            </div>

            {/* Botão de Fechar que redireciona ao feed (Mobile apenas) */}
            <button
              onClick={() => navigate('/feed')}
              className="calendar-close-btn"
              aria-label="Fechar"
            >
              <span className="fi fi-br-cross" aria-hidden="true" />
            </button>
          </div>

          {/* Grade Mensal do Calendário */}
          <div className="calendar-card">
            <div className="calendar-month-selector">
              <h2>
                {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
              </h2>

              <div className="calendar-month-nav">
                <button onClick={previousMonth} className="calendar-month-nav-btn">
                  ‹
                </button>
                <button onClick={nextMonth} className="calendar-month-nav-btn">
                  ›
                </button>
              </div>
            </div>

            <div className="calendar-days-grid">
              {/* Cabeçalho de dias da semana */}
              {weekDays.map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="calendar-weekday-cell"
                >
                  {day}
                </div>
              ))}

              {/* Dias do Mês */}
              {days.map((day) => {
                const hasItems = items.some((item) => item.date === day.dateKey)
                const holiday = holidays.find((holidayItem) => holidayItem.date === day.dateKey)
                const isSelected = selectedDate === day.dateKey
                const isToday = todayKey === day.dateKey

                return (
                  <button
                    key={day.dateKey}
                    onClick={() => selectDay(day)}
                    className={`calendar-day-btn ${
                      !day.isCurrentMonth
                        ? 'calendar-day-btn-out-month'
                        : 'calendar-day-btn-current-month'
                    } ${
                      hasItems
                        ? 'calendar-day-btn-has-events'
                        : holiday
                            ? 'calendar-day-btn-is-holiday'
                            : ''
                    } ${
                      isSelected ? 'calendar-day-btn-selected' : ''
                    }`}
                  >
                    <span className={isToday ? 'calendar-day-today-indicator' : 'calendar-day-today-indicator-none'}>
                      {day.day}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Coluna da direita (Exibição de feriados e CRUD de compromissos) */}
        <div className="calendar-col-right">
          
          {/* Card informativo de Feriado Nacional */}
          <div className="calendar-holiday-card">
            {selectedHoliday ? (
              <>
                <span className="calendar-holiday-date">
                  {formatDatePt(selectedHoliday.date)}
                </span>
                <span className="calendar-holiday-name">
                  {selectedHoliday.name}
                </span>
                <p className="calendar-holiday-desc">Feriado nacional</p>
              </>
            ) : (
              <>
                <span className="calendar-holiday-date">
                  Nenhum feriado nacional
                </span>
                <p className="calendar-holiday-desc">
                  Selecione uma data marcada em laranja.
                </p>
              </>
            )}
          </div>

          {/* Agenda e Gerenciamento de tarefas do dia selecionado */}
          <div className="calendar-schedule-card">
            <div>
              <h3 className="calendar-schedule-title">
                Agenda do dia {formatDatePt(selectedDate)}:
              </h3>

              {loading ? (
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>Carregando...</p>
              ) : selectedItems.length === 0 ? (
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af' }}>
                  Nenhuma programação para este dia.
                </p>
              ) : (
                <div className="calendar-schedule-list">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`calendar-schedule-item ${item.done ? 'calendar-schedule-item-done' : ''}`}
                    >
                      <p className={`calendar-schedule-item-text ${item.done ? 'calendar-schedule-item-text-done' : ''}`}>
                        {item.description}
                      </p>

                      <div className="calendar-schedule-item-actions">
                        <button
                          onClick={() => startEditing(item)}
                          className="calendar-action-btn-gray"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => toggleDone(item)}
                          className="calendar-action-btn-green"
                        >
                          {item.done ? 'Desfazer' : 'Feito'}
                        </button>

                        <button
                          onClick={() => deleteSchedule(item.id)}
                          className="calendar-action-btn-red"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input e botão para Adicionar/Editar tarefa */}
            <div className="calendar-add-form">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Digite uma programação..."
                className="calendar-schedule-textarea"
              />

              <button
                onClick={saveSchedule}
                className="calendar-add-btn"
              >
                {editingItem ? 'Salvar edição' : 'Adicionar programação'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu de navegação inferior Mobile */}
      <nav className="calendar-mobile-nav">
        <div onClick={() => navigate('/search')} className="calendar-nav-item">
          <span className="fi fi-br-search" aria-hidden="true" />
        </div>
        <div onClick={() => navigate('/feed')} className="calendar-nav-item">
          <span className="fi fi-br-home" aria-hidden="true" />
        </div>
        <div className="calendar-nav-item-active">
          <span className="fi fi-br-calendar" aria-hidden="true" />
        </div>
      </nav>
    </div>
  )
}