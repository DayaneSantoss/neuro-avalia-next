"use client"

import { useState } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import format from "date-fns/format"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import getDay from "date-fns/getDay"
import addDays from "date-fns/addDays"
import isAfter from "date-fns/isAfter"
import ptBR from "date-fns/locale/pt-BR"
import "react-big-calendar/lib/css/react-big-calendar.css"

const locales = { "pt-BR": ptBR }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

export default function AgendaPage() {
  const [eventos, setEventos] = useState([
    { id: 1, title: "Sessão com João", start: new Date(2025, 8, 5, 14, 0), end: new Date(2025, 8, 5, 15, 0) },
    { id: 2, title: "Sessão com Maria", start: new Date(2025, 8, 6, 10, 0), end: new Date(2025, 8, 6, 11, 0) },
  ])
  const [view, setView] = useState("month")
  const [date, setDate] = useState(new Date())
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoAtual, setEventoAtual] = useState({ title: "", start: null, end: null, id: null })

  const agora = new Date()
  const proximasReunioes = eventos
    .filter(ev => isAfter(ev.start, agora))
    .sort((a, b) => a.start - b.start)
    .slice(0, 5)

  const handleSelectSlot = (slotInfo) => {
    setEventoAtual({ title: "", start: slotInfo.start, end: slotInfo.end, id: null })
    setModalAberto(true)
  }

  const handleSelectEvent = (evento) => {
    setEventoAtual({ ...evento })
    setModalAberto(true)
  }

  const salvarEvento = () => {
    if (!eventoAtual.title || !eventoAtual.start || !eventoAtual.end) return alert("Preencha todos os campos")
    if (eventoAtual.id) {
      setEventos(eventos.map(ev => (ev.id === eventoAtual.id ? eventoAtual : ev)))
    } else {
      setEventos([...eventos, { ...eventoAtual, id: Date.now() }])
    }
    setModalAberto(false)
  }

  const removerEvento = () => {
    if (!eventoAtual.id) return
    setEventos(eventos.filter(ev => ev.id !== eventoAtual.id))
    setModalAberto(false)
  }

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      <div className="bg-indigo-400 border border-indigo-800 rounded-3xl px-8 py-6 mb-10 shadow-md">
        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
          Agenda
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendário */}
        <div className="flex-1 bg-white p-4 rounded-2xl shadow">
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 , color:"black"}}
            views={["month", "week", "day"]}
            view={view}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            onView={(newView) => setView(newView)}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            messages={{
              month: "Mês",
              week: "Semana",
              day: "Dia",
              today: "Hoje",
              previous: "Anterior",
              next: "Próximo",
            }}
            components={{
              toolbar: (props) => (
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { props.onNavigate("TODAY"); setDate(new Date()) }}
                      className="px-4 py-2 bg-indigo-200 text-indigo-800 rounded-xl hover:bg-indigo-300 transition"
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => { props.onNavigate("PREV"); setDate(addDays(date, view === "month" ? -30 : -7)) }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => { props.onNavigate("NEXT"); setDate(addDays(date, view === "month" ? 30 : 7)) }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                    >
                      Próximo →
                    </button>
                  </div>
                  <h2 className="text-lg font-semibold text-indigo-700">{props.label}</h2>
                  <div className="flex gap-2">
                    {["month", "week", "day"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`px-3 py-1 rounded-xl ${
                          view === v ? "bg-indigo-300 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {v === "month" ? "Mês" : v === "week" ? "Semana" : "Dia"}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            }}
          />
        </div>

        {/* Próximas reuniões */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white p-4 rounded-2xl shadow h-fit sticky top-10">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">Próximas Reuniões</h2>
            {proximasReunioes.length === 0 ? (
              <p className="text-gray-600">Nenhuma reunião marcada.</p>
            ) : (
              <ul className="space-y-3">
                {proximasReunioes.map(ev => (
                  <li key={ev.id} className="bg-indigo-100 text-indigo-800 p-3 rounded-xl shadow flex justify-between items-center">
                    <span className="font-medium">{ev.title}</span>
                    <span className="text-sm">
                      {format(ev.start, "dd/MM HH:mm")} - {format(ev.end, "HH:mm")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal de criação/edição */}
      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold text-indigo-700">
              {eventoAtual.id ? "Editar Reunião" : "Nova Reunião"}
            </h2>

            <input
              type="text"
              placeholder="Título da reunião"
              value={eventoAtual.title}
              onChange={(e) => setEventoAtual({ ...eventoAtual, title: e.target.value })}
              className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl"
            />
            <label className="flex flex-col gap-2">
              Data e hora de início:
              <input
                type="datetime-local"
                value={eventoAtual.start.toISOString().slice(0,16)}
                onChange={(e) => setEventoAtual({ ...eventoAtual, start: new Date(e.target.value) })}
                className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl"
              />
            </label>
            <label className="flex flex-col gap-2">
              Data e hora de término:
              <input
                type="datetime-local"
                value={eventoAtual.end.toISOString().slice(0,16)}
                onChange={(e) => setEventoAtual({ ...eventoAtual, end: new Date(e.target.value) })}
                className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl"
              />
            </label>

            <div className="flex justify-end gap-2">
              {eventoAtual.id && (
                <button onClick={removerEvento} className="px-4 py-2 bg-red-200 text-red-800 rounded-xl hover:bg-red-300">
                  Remover
                </button>
              )}
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-200">
                Cancelar
              </button>
              <button onClick={salvarEvento} className="px-4 py-2 bg-indigo-300 text-indigo-700 rounded-xl hover:bg-indigo-200">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
