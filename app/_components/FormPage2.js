'use client'

import { useState, useEffect } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FormPdf from '@/app/_components/FormPdf'
import { salvarRespostas } from '@/app/_lib/actions'
import toast from 'react-hot-toast'

export default function Formulario({ perguntas = [], idPaciente, idFormulario, pacient, perfil }) {
  const [respostas, setRespostas] = useState({})
  const [extras, setExtras] = useState({})
  const [selecionadas, setSelecionadas] = useState({})
  const [loading, setLoading] = useState(false) // controla estado do botão

  // Inicializa respostas, extras e selecionadas
  useEffect(() => {
    const initRespostas = {}
    const initExtras = {}
    const initSelecionadas = {}

    perguntas.forEach((p) => {
      if (p.tipo_resposta === 'simNao' && p.extraOn && p.resposta) {
        const partes = p.resposta.split(';')
        initRespostas[p.id_pergunta] = partes[0].trim() || ''
        initExtras[p.id_pergunta] = partes[1]?.trim() || p.respostaExtra || ''
      } else {
        initRespostas[p.id_pergunta] = p.resposta || ''
        initExtras[p.id_pergunta] = p.respostaExtra || ''
      }

      initSelecionadas[p.id_pergunta] = p.selecionada === true || p.selecionada === 1
    })

    setRespostas(initRespostas)
    setExtras(initExtras)
    setSelecionadas(initSelecionadas)
  }, [perguntas])

  function handleSimNaoChange(id, valor) {
    setRespostas(prev => ({ ...prev, [id]: valor }))
    const pergunta = perguntas.find(p => p.id_pergunta === id)
    if (!pergunta?.extraOn || valor.toLowerCase() !== pergunta.extraOn.toLowerCase()) {
      setExtras(prev => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
    }
  }

  function handleExtraChange(id, valor) {
    setExtras(prev => ({ ...prev, [id]: valor }))
  }

  function handleTextChange(id, valor) {
    setRespostas(prev => ({ ...prev, [id]: valor }))
  }

  function toggleSelecionada(id) {
    setSelecionadas(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true) // ativa estado de carregamento

    const formData = new FormData()
    perguntas.forEach(p => {
      formData.append(`selecionada_${p.id_pergunta}`, selecionadas[p.id_pergunta] ? '1' : '0')
      if (!selecionadas[p.id_pergunta]) return

      if (p.tipo_resposta === 'simNao' && p.extraOn) {
        const base = respostas[p.id_pergunta] || ''
        const extra = extras[p.id_pergunta] || ''
        const valor = (extra && base.toLowerCase() === p.extraOn.toLowerCase())
          ? `${base}; ${extra}`
          : base
        formData.append(`resposta_${p.id_pergunta}`, valor)
      } else {
        formData.append(`resposta_${p.id_pergunta}`, respostas[p.id_pergunta] || '')
      }
    })

    try {
      await salvarRespostas(idFormulario, idPaciente, formData)
      toast.success('✅ Respostas salvas com sucesso!')
    } catch (error) {
      toast.error('❌ Erro ao salvar, tente novamente.')
    } finally {
      setLoading(false) // volta ao normal
    }
  }

  // Agrupa perguntas por seção para renderizar
  const secoesFormulario = perguntas.reduce((acc, p) => {
    const secaoExistente = acc.find(s => s.titulo === p.secao)
    if (secaoExistente) {
      secaoExistente.perguntas.push(p)
    } else {
      acc.push({ titulo: p.secao || 'Sem Seção', perguntas: [p] })
    }
    return acc
  }, [])

  // Agrupa só selecionadas para PDF
  const secoesPdf = perguntas.reduce((acc, p) => {
    if (!selecionadas[p.id_pergunta]) return acc
    const secaoExistente = acc.find(s => s.titulo === p.secao)
    let respostaCompleta = respostas[p.id_pergunta] || ''
    if (p.tipo_resposta === 'simNao' && p.extraOn) {
      if (respostas[p.id_pergunta]?.toLowerCase() === p.extraOn.toLowerCase()) {
        const extraTexto = extras[p.id_pergunta] || ''
        if (extraTexto) respostaCompleta = `${respostas[p.id_pergunta]} ; ${extraTexto}`
      }
    }
    if (secaoExistente) {
      secaoExistente.perguntas.push({ ...p, resposta: respostaCompleta })
    } else {
      acc.push({ titulo: p.secao || 'Sem Seção', perguntas: [{ ...p, resposta: respostaCompleta }] })
    }
    return acc
  }, [])

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 pb-40">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-white mb-8 px-6 py-4 bg-indigo-400 rounded-lg border border-indigo-700">
          Formulário de Anamnese
        </h2>

        <form id="formulario" onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow border border-gray-200 mb-20">
          {secoesFormulario.map((secao, idxSecao) => (
            <section key={idxSecao} className="mb-10">
              <h3 className="text-xl font-bold mb-4 border-b pb-2 text-indigo-700">{secao.titulo}</h3>
              {secao.perguntas.map(p => (
                <div key={p.id_pergunta} className="mb-6 flex items-start justify-between" style={{ gap: '1rem' }}>
                  <div className="flex-grow">
                    <label className={`block font-medium mb-2 ${!selecionadas[p.id_pergunta] ? 'text-gray-400' : 'text-gray-800'}`}>
                      {p.pergunta}
                    </label>
                    {p.tipo_resposta === 'simNao' ? (
                      <>
                        <div className="flex gap-6 mb-2 text-gray-900 font-semibold">
                          <label className="flex items-center cursor-pointer">
                            <input type="radio" name={`resposta_${p.pergunta}`} value="Sim"
                              checked={respostas[p.id_pergunta] === 'Sim'}
                              onChange={() => handleSimNaoChange(p.id_pergunta, 'Sim')}
                              className="form-radio text-indigo-700"
                              disabled={!selecionadas[p.id_pergunta]}
                              required={selecionadas[p.id_pergunta]}
                            />
                            <span className={`ml-2 ${!selecionadas[p.id_pergunta] ? 'text-gray-400' : ''}`}>Sim</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input type="radio" name={`resposta_${p.pergunta}`} value="Não"
                              checked={respostas[p.id_pergunta] === 'Não'}
                              onChange={() => handleSimNaoChange(p.id_pergunta, 'Não')}
                              className="form-radio text-indigo-700"
                              disabled={!selecionadas[p.id_pergunta]}
                              required={selecionadas[p.id_pergunta]}
                            />
                            <span className={`ml-2 ${!selecionadas[p.id_pergunta] ? 'text-gray-400' : ''}`}>Não</span>
                          </label>
                        </div>
                        {p.extraOn && (respostas[p.id_pergunta]?.toLowerCase() === p.extraOn.toLowerCase() || extras[p.id_pergunta]) && (
                          <textarea
                            name={`extra_${p.id_pergunta}`}
                            value={extras[p.id_pergunta] || ''}
                            onChange={e => handleExtraChange(p.id_pergunta, e.target.value)}
                            placeholder="Digite sua resposta"
                            className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                            disabled={!selecionadas[p.id_pergunta]}
                            rows={4}
                          />
                        )}
                      </>
                    ) : (
                      <textarea
                        name={`resposta_${p.id_pergunta}`}
                        value={respostas[p.id_pergunta] || ''}
                        onChange={e => handleTextChange(p.id_pergunta, e.target.value)}
                        placeholder="Digite sua resposta"
                        className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        disabled={!selecionadas[p.id_pergunta]}
                        rows={5}
                      />
                    )}
                  </div>
                  <div className="flex items-center pl-4">
                    <input type="checkbox" checked={selecionadas[p.id_pergunta]} onChange={() => toggleSelecionada(p.id_pergunta)}
                      title="Ativar/Desativar pergunta" style={{ transform: 'scale(1.3)', marginLeft: '0.5rem' }} />
                  </div>
                </div>
              ))}
            </section>
          ))}
        </form>

        {/* Botões fixos */}
        <div className="bg-white border-t border-gray-300 p-4 flex justify-end gap-4 shadow-lg z-50 rounded-xl"
          style={{ position: 'fixed', bottom: 0, left: '18rem', width: 'calc(100vw - 19rem)', boxShadow: '0 -2px 8px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <button type="submit" form="formulario"
            disabled={loading}
            className={`px-6 py-2 rounded transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>

          <PDFDownloadLink
            document={<FormPdf perguntas={secoesPdf} pacient={pacient} perfil={perfil} />}
            fileName="formulario-respostas.pdf"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition flex items-center justify-center">
            {({ loading }) => (loading ? 'Gerando PDF...' : 'Baixar PDF')}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  )
}
