'use client'

import { useState } from 'react'
import { gerarHipoteses, gerarResumoQueixa } from '@/app/_lib/ia-service'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { salvarResumoAnamnese, salvarHipotese, salvarHipotesesGeradas, excluirHipotese} from '@/app/_lib/actions'

export default function HipoteseIA({ pacient, perguntas, resumoInicial, hipotesesInicial }) {
  const [textoResumo, setTextoResumo] = useState(resumoInicial || "")
  const [hipoteses, setHipoteses] = useState(
    (hipotesesInicial || []).map(h => ({
      ...h,
      formas_avaliacao: Array.isArray(h.formas_avaliacao) ? h.formas_avaliacao : (h.formas_avaliacao ? JSON.parse(h.formas_avaliacao) : []),
      construtos: Array.isArray(h.construtos) ? h.construtos : (h.construtos ? JSON.parse(h.construtos) : [])
    }))
  )
  const [loadingResumo, setLoadingResumo] = useState(false)
  const [loadingHipoteses, setLoadingHipoteses] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [novaHipotese, setNovaHipotese] = useState({
    descricao: '',
    formas_avaliacao: [],
    construtos: []
  })
  const [expandido, setExpandido] = useState({}) // controla visibilidade das avaliações

  // -----------------------------
  // Função para gerar resumo da anamnese
  // -----------------------------
  const handleGerarResumo = async () => {
    // Combina todas as respostas do usuário em uma única string
    const respostasPreenchidas = perguntas
    .filter(p => p.resposta && p.resposta.trim().length > 0)
    .map(p => `${p.pergunta}: ${p.resposta}`)
    .join('\n')

  console.log(respostasPreenchidas)
  if (!respostasPreenchidas) {
    alert('Não há respostas preenchidas na anamnese para gerar o resumo!')
    return
  }
    
    setLoadingResumo(true)
    try {
      // Chamada à IA para gerar o resumo
      const resumo = await gerarResumoQueixa(respostasPreenchidas, pacient.dataNascimento)
      setTextoResumo(resumo)
      // Salva o resumo no banco
      await salvarResumoAnamnese(pacient.id, resumo)
    } catch (e) {
      console.error(e)
      alert('Ocorreu um erro ao gerar o resumo da anamnese.')
    } finally {
      setLoadingResumo(false)
    }
  }

  // -----------------------------
  // Função para gerar hipóteses diagnósticas
  // -----------------------------
  const handleGerarHipoteses = async () => {

    if (!textoResumo.trim()) return alert('Digite a queixa ou gere o resumo da criança primeiro!')
    
    setLoadingHipoteses(true)
    try {
      // Chamada à IA para gerar hipóteses
      const hipotesesGeradas = await gerarHipoteses({ respostasAnamnese: textoResumo })

      // Formata cada hipótese para garantir arrays válidos
      const hipotesesFormatadas = hipotesesGeradas.map(h => ({
        ...h,
        formas_avaliacao: Array.isArray(h.formas_avaliacao) ? h.formas_avaliacao : (h.formas_avaliacao ? JSON.parse(h.formas_avaliacao) : []),
        construtos: Array.isArray(h.construtos) ? h.construtos : (h.construtos ? JSON.parse(h.construtos) : [])
      }))

      setHipoteses(hipotesesFormatadas)
      // Salva hipóteses e resumo no banco
      await salvarHipotesesGeradas(pacient.id, hipotesesFormatadas)
      await salvarResumoAnamnese(pacient.id, textoResumo)
    } catch (e) {
      console.error(e)
      alert('Erro ao gerar hipóteses diagnósticas')
    } finally {
      setLoadingHipoteses(false)
    }
  }

  // -----------------------------
  // Função para salvar nova hipótese criada manualmente
  // -----------------------------
  const handleSalvarHipotese = async () => {
    if (!novaHipotese.descricao.trim()) return alert('Descreva a hipótese antes de salvar.')

    try {
      const nova = {
        hipotese: novaHipotese.descricao,
        formas_avaliacao: Array.isArray(novaHipotese.formas_avaliacao) ? novaHipotese.formas_avaliacao : [],
        construtos: Array.isArray(novaHipotese.construtos) ? novaHipotese.construtos : [],
        origem: 'Profissional'
      }

      const registro = await salvarHipotese(pacient.id, nova)
      setHipoteses(prev => [...prev, registro])
      setNovaHipotese({ descricao: '', formas_avaliacao: [], construtos: [] })
      setShowModal(false)
    } catch (e) {
      console.error("Erro ao salvar hipótese:", e)
      alert("Não foi possível salvar a hipótese.")
    }
  }

  // -----------------------------
  // Função para excluir hipótese
  // -----------------------------
  const handleExcluirHipotese = async (idHipotese) => {
    try {
      await excluirHipotese(idHipotese)
      setHipoteses(prev => prev.filter(h => h.id !== idHipotese))
    } catch (e) {
      alert("Erro ao excluir hipótese")
    }
  }

  // -----------------------------
  // Alterna visibilidade das avaliações
  // -----------------------------
  const toggleExpand = (idx) => {
    setExpandido(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-indigo-400 border border-indigo-200 rounded-3xl px-8 py-5 mb-10 shadow-md">
        <h1 className="text-2xl font-bold text-white rounded-lg ">
          Hipóteses Diagnósticas
        </h1>
      </div>

      {/* Resumo da anamnese / queixa */}
      <div className="bg-primary-10 p-6 rounded-xl shadow space-y-3">
        <h2 className="text-2xl font-bold text-indigo-600">
          Resumo da Anamnese / Queixa Inicial
        </h2>
        <p className="text-gray-700 mb-2">
          Digite a queixa principal da criança ou clique em &quot;Gerar resumo da Anamnese&quot; para que a IA sintetize as respostas fornecidas.
        </p>
        <textarea
          value={textoResumo}
          onChange={e => setTextoResumo(e.target.value)}
          placeholder="Digite aqui a queixa da criança ou utilize o botão de geração automática..."
          className="w-full border border-indigo-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none text-gray-900"
          rows={6}
        />
        <p className="text-black mt-2 md:mt-0">
          Use os botões abaixo para gerar resumo da anamnese da criança e gerar hipóteses automáticas com auxílio da IA. Você também pode adicionar hipóteses manualmente.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleGerarResumo}
            disabled={loadingResumo}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {loadingResumo ? 'Gerando resumo...' : 'Gerar resumo da Anamnese'}
          </button>
          <button
            onClick={handleGerarHipoteses}
            disabled={loadingHipoteses || !textoResumo.trim()}
            className={`px-4 py-2 rounded-lg transition 
              ${loadingHipoteses || !textoResumo.trim()
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"  // estado desabilitado
                : "bg-indigo-600 text-white hover:bg-indigo-700"  // estado ativo
              }`}
          >
            {loadingHipoteses ? 'Gerando hipóteses...' : 'Gerar hipóteses diagnósticas'}
          </button>
        </div>
      </div>

      {/* Lista de hipóteses */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-indigo-600">Hipóteses</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Adicionar hipótese manual
          </button>
        </div>

        {hipoteses.map((h, idx) => {
          const isExpanded = expandido[idx] || false
          return (
            <div key={idx} className="border rounded-xl shadow-md hover:shadow-lg transition p-5 space-y-3 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-gray-900">
                  {h.hipotese} <span className="ml-2 text-sm text-gray-500">({h.origem})</span>
                </h3>
                <div className="flex gap-2">
                  {Array.isArray(h.formas_avaliacao) && h.formas_avaliacao.length > 0 && (
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      {isExpanded ? 'Ocultar Avaliações' : 'Ver Avaliações'}
                      {isExpanded ? <ChevronUp size={16} className="ml-1"/> : <ChevronDown size={16} className="ml-1"/>}
                    </button>
                  )}
                  <button
                    onClick={() => handleExcluirHipotese(h.id)}
                    className="flex items-center px-2 text-indigo-500 rounded-lg hover:bg-indigo-200 transition"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>

              {isExpanded && Array.isArray(h.formas_avaliacao) && h.formas_avaliacao.length > 0 && (
                <ul className="list-disc list-inside text-gray-800 space-y-1 mt-2">
                  {h.formas_avaliacao.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal para nova hipótese */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Nova Hipótese Manual</h3>
            <p className="text-gray-700">
              Descreva a hipótese diagnóstica que deseja adicionar. Opcionalmente, você pode incluir formas de avaliação ou construtos relacionados.
            </p>
            <textarea
              className="w-full border rounded-lg p-3 text-gray-900"
              rows={3}
              placeholder="Digite a descrição da hipótese aqui..."
              value={novaHipotese.descricao}
              onChange={e => setNovaHipotese(prev => ({ ...prev, descricao: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarHipotese}
                className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
