import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

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

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDatePt(dateKey) {
  const [year, month, day] = dateKey.split('-')
  return `${day}/${month}/${year}`
}

function getMonthKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

function getCalendarDays(currentDate) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startDay = firstDayOfMonth.getDay()

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

  const days = useMemo(() => getCalendarDays(currentDate), [currentDate])

  const selectedItems = items.filter((item) => item.date === selectedDate)
  const selectedHoliday = holidays.find(
  (holiday) => holiday.date === selectedDate
  )  
  const todayKey = formatDateKey(new Date())

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    fetchSchedule()
    }, [monthKey, navigate])

    useEffect(() => {
    fetchHolidays()
    }, [year])

  async function fetchSchedule() {
    try {
      setLoading(true)

      const token = localStorage.getItem('token')

      const response = await axios.get('http://localhost:3000/api/schedules', {
        params: { month: monthKey },
        headers: { Authorization: `Bearer ${token}` },
      })

      setItems(response.data || [])
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
  
    async function fetchHolidays() {
        try {
            const response = await axios.get(
            `https://brasilapi.com.br/api/feriados/v1/${year}`
            )

            setHolidays(response.data || [])
        } catch (error) {
            console.error('Erro ao buscar feriados:', error)
            setHolidays([])
        }
    }


  function previousMonth() {
    setCurrentDate((current) => {
      const newDate = new Date(current)
      newDate.setMonth(current.getMonth() - 1)
      return newDate
    })
  }

  function nextMonth() {
    setCurrentDate((current) => {
      const newDate = new Date(current)
      newDate.setMonth(current.getMonth() + 1)
      return newDate
    })
  }

  function selectDay(day) {
    setSelectedDate(day.dateKey)
    setEditingItem(null)
    setDescription('')
  }

  function startEditing(item) {
    setEditingItem(item)
    setDescription(item.description)
  }

  async function saveSchedule() {
    if (!description.trim()) {
      alert('Digite uma descrição para a agenda.')
      return
    }

    try {
      const token = localStorage.getItem('token')

      if (editingItem) {
        const response = await axios.put(
          `http://localhost:3000/api/schedules/${editingItem.id}`,
          {
            description,
            date: selectedDate,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === editingItem.id ? response.data : item,
          ),
        )
      } else {
        const response = await axios.post(
          'http://localhost:3000/api/schedules',
          {
            date: selectedDate,
            description,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        setItems((currentItems) => [...currentItems, response.data])
      }

      setDescription('')
      setEditingItem(null)
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao salvar agenda')
    }
  }

  async function toggleDone(item) {
    try {
      const token = localStorage.getItem('token')

      const response = await axios.put(
        `http://localhost:3000/api/schedules/${item.id}`,
        {
          done: !item.done,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setItems((currentItems) =>
        currentItems.map((scheduleItem) =>
          scheduleItem.id === item.id ? response.data : scheduleItem,
        ),
      )
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao atualizar item')
    }
  }

  async function deleteSchedule(itemId) {
    try {
      const token = localStorage.getItem('token')

      await axios.delete(`http://localhost:3000/api/schedules/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

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
    <div className="min-h-screen bg-[#F4F4F4] font-sans p-6 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl w-full mx-auto items-start">
        <div className="col-span-1 md:col-span-7 flex flex-col gap-6">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-white rounded-2xl px-6 py-4 flex-1 shadow-xs">
              <h1 className="text-2xl font-extrabold text-black tracking-tight">
                Programação para:
              </h1>
            </div>

            <button
              onClick={() => navigate('/feed')}
              className="bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 w-12 h-12 rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer text-lg md:hidden"
              aria-label="Fechar"
            >
              <span className="fi fi-br-cross text-[18px]" aria-hidden="true" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xs w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-black">
                {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
              </h2>

              <div className="flex gap-4 text-gray-600 font-bold">
                <button onClick={previousMonth} className="hover:text-black cursor-pointer px-1">
                  ‹
                </button>
                <button onClick={nextMonth} className="hover:text-black cursor-pointer px-1">
                  ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-t border-l border-gray-100 text-center">
              {weekDays.map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="py-3 font-semibold text-gray-800 border-b border-r border-gray-100"
                >
                  {day}
                </div>
              ))}

              {days.map((day) => {
                const hasItems = items.some((item) => item.date === day.dateKey)
                const holiday = holidays.find((holidayItem) => holidayItem.date === day.dateKey)
                const isSelected = selectedDate === day.dateKey
                const isToday = todayKey === day.dateKey

                return (
                  <button
                    key={day.dateKey}
                    onClick={() => selectDay(day)}
                    className={`h-[70px] w-full font-medium border-b border-r border-gray-100 transition-colors flex items-center justify-center ${
                      !day.isCurrentMonth
                        ? 'text-gray-300 bg-gray-50/50'
                        : 'text-gray-800'
                    } ${
                      hasItems
                        ? 'bg-[#A2E9A6] font-bold'
                        : holiday
                            ? 'bg-[#FBC07F] font-bold'
                            : ''
                    } ${
                      isSelected ? 'ring-1 ring-black ring-inset' : ''
                    }`}
                  >
                     <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-gray-200' : ''
                        }`}
                    >{day.day}
                    </span>
                    
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-5 flex flex-col gap-4 md:mt-[72px]">
            <div className="bg-[#FBC07F] rounded-2xl p-5 shadow-xs flex flex-col gap-1 text-gray-900">
                {selectedHoliday ? (
                    <>
                    <span className="font-extrabold text-sm leading-tight block">
                        {formatDatePt(selectedHoliday.date)}
                    </span>
                    <span className="font-extrabold text-sm leading-tight block">
                        {selectedHoliday.name}
                    </span>
                    <p className="text-xs font-medium mt-1">Feriado nacional</p>
                    </>
                ) : (
                    <>
                    <span className="font-extrabold text-sm leading-tight block">
                        Nenhum feriado nacional
                    </span>
                    <p className="text-xs font-medium mt-1">
                        Selecione uma data marcada em laranja.
                    </p>
                    </>
                )}
            </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 min-h-[160px]">
            <div>
              <h3 className="font-extrabold text-sm text-black mb-2">
                Agenda do dia {formatDatePt(selectedDate)}:
              </h3>

              {loading ? (
                <p className="text-xs font-bold text-gray-500">Carregando...</p>
              ) : selectedItems.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 leading-relaxed">
                  Nenhuma programação para este dia.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl p-3 ${
                        item.done ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <p className={`text-xs font-bold leading-relaxed ${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {item.description}
                      </p>

                      <div className="flex flex-wrap justify-end gap-1.5 text-[10px] font-bold mt-3">
                        <button
                          onClick={() => startEditing(item)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-400 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => toggleDone(item)}
                          className="bg-[#A2E9A6] hover:bg-[#8ee093] text-white px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          {item.done ? 'Desfazer' : 'Feito'}
                        </button>

                        <button
                          onClick={() => deleteSchedule(item.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-400 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Digite uma programação..."
                className="w-full min-h-[80px] bg-gray-50 rounded-xl p-3 text-xs font-medium text-gray-800 outline-none resize-none placeholder:text-gray-400"
              />

              <button
                onClick={saveSchedule}
                className="bg-black hover:bg-gray-900 text-white font-bold text-xs py-3 rounded-xl transition-colors"
              >
                {editingItem ? 'Salvar edição' : 'Adicionar programação'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white px-8 py-4 flex justify-between items-center z-50 rounded-t-[32px] border-t border-gray-100 md:hidden">
        <div
          onClick={() => navigate('/search')}
          className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <span className="fi fi-br-search text-[22px] opacity-60" aria-hidden="true" />
        </div>

        <div
          onClick={() => navigate('/feed')}
          className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <span className="fi fi-br-home text-[22px] opacity-60" aria-hidden="true" />
        </div>

        <div className="w-16 h-16 bg-black flex items-center justify-center text-white shadow-lg rounded-full cursor-pointer">
          <span className="fi fi-br-calendar text-[22px] opacity-80" aria-hidden="true" />
        </div>
      </nav>
    </div>
  )
}