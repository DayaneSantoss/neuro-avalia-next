"use client"

import { useState, useMemo } from "react"
import { CheckCircle, XCircle, DollarSign, Edit2, Trash2, PlusCircle } from "lucide-react"

export default function FinanceiroPage() {
  // Exemplo de dados de sessões/pagamentos
  const [transacoes, setTransacoes] = useState([
    { id: 1, paciente: "João", sessao: "Sessão 1", data: "2025-09-05", valor: 120, pago: true },
    { id: 2, paciente: "Maria", sessao: "Sessão 2", data: "2025-09-06", valor: 150, pago: false },
    { id: 3, paciente: "Pedro", sessao: "Sessão 1", data: "2025-09-07", valor: 100, pago: true },
    { id: 4, paciente: "Ana", sessao: "Sessão 3", data: "2025-09-08", valor: 130, pago: false },
  ])

  const [modalAberto, setModalAberto] = useState(false)
  const [transacaoEditando, setTransacaoEditando] = useState(null)
  const [paciente, setPaciente] = useState("")
  const [sessao, setSessao] = useState("")
  const [data, setData] = useState("")
  const [valor, setValor] = useState("")
  const [pago, setPago] = useState(false)

  // Resumo financeiro
  const resumo = useMemo(() => {
    const total = transacoes.length
    const pagos = transacoes.filter(t => t.pago).length
    const naoPagos = transacoes.filter(t => !t.pago).length
    const totalRecebido = transacoes.filter(t => t.pago).reduce((acc, t) => acc + t.valor, 0)
    const totalPendentes = transacoes.filter(t => !t.pago).reduce((acc, t) => acc + t.valor, 0)
    return { total, pagos, naoPagos, totalRecebido, totalPendentes }
  }, [transacoes])

  const abrirModal = (t = null) => {
    if (t) {
      setTransacaoEditando(t)
      setPaciente(t.paciente)
      setSessao(t.sessao)
      setData(t.data)
      setValor(t.valor)
      setPago(t.pago)
    } else {
      setTransacaoEditando(null)
      setPaciente("")
      setSessao("")
      setData("")
      setValor("")
      setPago(false)
    }
    setModalAberto(true)
  }

  const salvarTransacao = () => {
    if (!paciente || !sessao || !data || !valor) return alert("Preencha todos os campos")
    const novaTransacao = { id: transacaoEditando?.id || Date.now(), paciente, sessao, data, valor: Number(valor), pago }
    if (transacaoEditando) {
      setTransacoes(transacoes.map(t => t.id === transacaoEditando.id ? novaTransacao : t))
    } else {
      setTransacoes([...transacoes, novaTransacao])
    }
    setModalAberto(false)
  }

  const removerTransacao = (id) => setTransacoes(transacoes.filter(t => t.id !== id))

  return (
    <div className="px-10 py-10 max-w-6xl mx-auto">
      <div className="bg-indigo-400 rounded-3xl px-8 py-6 mb-10 shadow-md text-white border border-indigo-800">
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <p className="mt-2 text-indigo-100">Controle de sessões, pagamentos e status dos pacientes.</p>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 text-blue-700 p-4 rounded-2xl shadow text-center">
          <p className="font-semibold">Total de Sessões</p>
          <p className="text-2xl font-bold">{resumo.total}</p>
        </div>
        <div className="bg-green-100 text-green-700 p-4 rounded-2xl shadow text-center">
          <p className="font-semibold">Pagas</p>
          <p className="text-2xl font-bold">{resumo.pagos}</p>
          <p>R$ {resumo.totalRecebido}</p>
        </div>
        <div className="bg-red-100 text-red-700 p-4 rounded-2xl shadow text-center">
          <p className="font-semibold">Pendentes</p>
          <p className="text-2xl font-bold">{resumo.naoPagos}</p>
          <p>R$ {resumo.totalPendentes}</p>
        </div>
      </div>

      {/* Lista de transações */}
      <div className="bg-white p-6 rounded-2xl shadow ">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold text-indigo-700">Transações</h2>
          <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-indigo-200 text-indigo-800 px-4 py-2 rounded-2xl hover:bg-indigo-300 transition">
            <PlusCircle size={18} /> Nova Sessão
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-500">
              <th className="p-2">Paciente</th>
              <th className="p-2">Sessão</th>
              <th className="p-2">Data</th>
              <th className="p-2">Valor (R$)</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50 text-gray-700">
                <td className="p-2">{t.paciente}</td>
                <td className="p-2">{t.sessao}</td>
                <td className="p-2">{t.data}</td>
                <td className="p-2">{t.valor}</td>
                <td className="p-2">{t.pago ? <CheckCircle className="inline text-green-600"/> : <XCircle className="inline text-red-600"/>}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => abrirModal(t)} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-2xl hover:bg-yellow-200 transition"><Edit2 size={16} /></button>
                  <button onClick={() => removerTransacao(t.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded-2xl hover:bg-red-200 transition"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold text-indigo-700">{transacaoEditando ? "Editar Sessão" : "Nova Sessão"}</h2>
            <input type="text" placeholder="Paciente" value={paciente} onChange={e => setPaciente(e.target.value)} className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl" />
            <input type="text" placeholder="Sessão" value={sessao} onChange={e => setSessao(e.target.value)} className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl" />
            <input type="date" placeholder="Data" value={data} onChange={e => setData(e.target.value)} className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl" />
            <input type="number" placeholder="Valor" value={valor} onChange={e => setValor(e.target.value)} className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl" />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={pago} onChange={e => setPago(e.target.checked)} />
              <span>Pago</span>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-200">Cancelar</button>
              <button onClick={salvarTransacao} className="px-4 py-2 bg-indigo-300 text-indigo-700 rounded-xl hover:bg-indigo-200">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
