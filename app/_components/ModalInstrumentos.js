"use client"

import { useState, useRef, useEffect, useMemo } from "react"

// Configuração padrão para novo instrumento
const defaultInstrumento = {
  nome: "",
  idade: "",
  descricao: "",
  tempo: "",
  referencia: "",
  areasProfissionais: [],
  construto: []
}

// -----------------------------
// Funções auxiliares
// -----------------------------

// Busca construtos de acordo com a sessão e hipóteses disponíveis
const getConstrutosDaSessao = (sessao, hipoteses) => {
  if (!sessao?.hipoteses?.length || !hipoteses) return []
  return [
    ...new Set(
      hipoteses
        .filter(h => sessao.hipoteses.includes(h.id))
        .flatMap(h => h.construtos || [])
    )
  ]
}

// Verifica se um instrumento deve ser recomendado
const isInstrumentoRecomendado = (sessao, hipoteses, inst, idadeSessao, verificarIdade) => {
  if (!sessao?.hipoteses?.length) return false
  const hips = hipoteses.filter(h => sessao.hipoteses.includes(h.id))

  return hips.some(h => {
    const construtoHipotese = (h.construtos || []).map(c => c.toLowerCase())
    const construtoInstrumento = Array.isArray(inst.construtos)
      ? inst.construtos.filter(Boolean).map(c => c.toLowerCase())
      : inst.construtos ? [inst.construtos.toLowerCase()] : []

    const construtoOk = construtoHipotese.some(ch =>
      construtoInstrumento.some(ci => ci.includes(ch))
    )

    const nomeOk = inst.nome && h.hipotese
      ? inst.nome.toLowerCase().includes(h.hipotese.toLowerCase())
      : false

    const idadeOk = verificarIdade(idadeSessao, inst.idade)

    return (construtoOk || nomeOk) && idadeOk
  })
}

export default function ModalInstrumentos({
  aberto,
  fechar,
  instrumentosDisponiveis,
  setInstrumentosDisponiveis,
  sessaoSelecionada,
  idadeFiltro,
  setIdadeFiltro,
  areasProfissionaisFiltro,
  setAreasProfissionaisFiltro,
  instrumentosSelecionados,
  toggleInstrumento,
  adicionarInstrumentosSelecionados,
  hipotesesDisponiveis,
  verificarIdade,
  idadeSessao,
  construtosFiltro,
  setConstrutosFiltro
}) {

  // -----------------------------
  // Estados
  // -----------------------------
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false)
  const [novoInstrumento, setNovoInstrumento] = useState(defaultInstrumento)

  // -----------------------------
  // Efeitos
  // -----------------------------
  useEffect(() => {
    setConstrutosFiltro(getConstrutosDaSessao(sessaoSelecionada, hipotesesDisponiveis))
  }, [sessaoSelecionada, hipotesesDisponiveis, setConstrutosFiltro])

  // Cache dos construtos disponíveis (melhora performance)
  const todosConstrutos = useMemo(() =>
    [...new Set(Object.values(instrumentosDisponiveis).flat().flatMap(i => i.construtos || []))],
    [instrumentosDisponiveis]
  )

  if (!aberto || !sessaoSelecionada) return null

  // -----------------------------
  // Funções
  // -----------------------------
  const abrirModalAdicionar = () => setModalAdicionarAberto(true)

  const fecharModalAdicionar = () => {
    setModalAdicionarAberto(false)
    setNovoInstrumento(defaultInstrumento)
  }

  const adicionarNovoInstrumento = () => {
    const categoria = "Custom"
    setInstrumentosDisponiveis(prev => {
      const copia = { ...prev }
      if (!copia[categoria]) copia[categoria] = []
      copia[categoria].push({
        ...novoInstrumento,
        id: crypto.randomUUID(),
        construto: Array.isArray(novoInstrumento.construto)
          ? novoInstrumento.construto
          : [novoInstrumento.construto]
      })
      return copia
    })
    fecharModalAdicionar()
  }

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Cabeçalho */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-indigo-600">Selecionar Instrumentos</h2>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b space-y-4">
          {/* Idade */}
          <div>
            <label className="font-semibold text-gray-800 mb-1 block">Idade</label>
            <select
              value={idadeFiltro ?? ""}
              onChange={(e) => setIdadeFiltro(e.target.value ? Number(e.target.value) : null)}
              className="border border-gray-300 rounded-xl p-2 w-full text-gray-700"
            >
              <option value="">Todas as idades</option>
              {Array.from({ length: 100 }, (_, i) => i + 1).map((idade) => (
                <option key={idade} value={idade}>{idade} anos</option>
              ))}
            </select>
          </div>

          {/* Construtos */}
          <div>
            <label className="font-semibold text-gray-800 mb-1">Construtos</label>
            <div className="border border-gray-300 rounded-xl p-2 flex flex-wrap gap-2 items-center">
              {construtosFiltro.map(c => (
                <span key={c} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1 text-sm">
                  {c}
                  <button
                    aria-label={`Remover construto ${c}`}
                    onClick={() => setConstrutosFiltro(construtosFiltro.filter(x => x !== c))}
                    className="font-bold text-blue-600 hover:text-blue-900 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              <select
                value=""
                onChange={e => {
                  const value = e.target.value
                  if (value && !construtosFiltro.includes(value)) {
                    setConstrutosFiltro([...construtosFiltro, value])
                  }
                  e.target.value = ""
                }}
                className="border-none outline-none flex-1 min-w-[120px] text-gray-600"
              >
                <option value="" disabled>Selecione...</option>
                {todosConstrutos.map(c => (
                  <option key={c} value={c} disabled={construtosFiltro.includes(c)}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Áreas Profissionais */}
          <div>
            <label className="font-semibold text-gray-800 mb-1">Áreas Profissionais</label>
            <div className="border border-gray-300 rounded-xl p-2 flex flex-wrap gap-2 items-center">
              {areasProfissionaisFiltro.map(area => (
                <span key={area} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1 text-sm">
                  {area}
                  <button
                    aria-label={`Remover área ${area}`}
                    onClick={() => setAreasProfissionaisFiltro(areasProfissionaisFiltro.filter(a => a !== area))}
                    className="font-bold text-blue-600 hover:text-blue-900 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              <select
                value=""
                onChange={e => {
                  const value = e.target.value
                  if (value && !areasProfissionaisFiltro.includes(value))
                    setAreasProfissionaisFiltro([...areasProfissionaisFiltro, value])
                  e.target.value = ""
                }}
                className="border-none outline-none flex-1 min-w-[120px] text-gray-600"
              >
                <option value="" disabled>Selecione...</option>
                {["Psicólogo","Neuropsicólogo","Pedagogo","Neuropsicopedagogo","Psiquiatra"].map(area => (
                  <option key={area} value={area} disabled={areasProfissionaisFiltro.includes(area)}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de instrumentos */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(instrumentosDisponiveis).map(([categoria, lista]) => {
            const instrumentos = Array.isArray(lista) ? lista : []

            const instrumentosFiltrados = instrumentos.filter(inst =>
              (!idadeFiltro || verificarIdade(idadeFiltro, inst.idade)) &&
              (areasProfissionaisFiltro.length === 0 || inst.areasProfissionais?.some(a => areasProfissionaisFiltro.includes(a))) &&
              (construtosFiltro.length === 0 || construtosFiltro.some(c =>
                (Array.isArray(inst.construtos) ? inst.construtos.join(",") : inst.construtos)?.includes(c)
              ))
            )

            if (instrumentosFiltrados.length === 0) return null

            return (
              <div key={categoria} className="mb-4">
                <h3 className="font-semibold text-black mb-2">{categoria}</h3>
                {instrumentosFiltrados.map(inst => {
                  const recomendado = isInstrumentoRecomendado(sessaoSelecionada, hipotesesDisponiveis, inst, idadeSessao, verificarIdade)

                  return (
                    <div key={inst.id} className="flex flex-col gap-1 mb-2 p-2 border rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-black flex items-center gap-2">
                          {inst.nome}
                          {recomendado && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Recomendado
                            </span>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          aria-label={`Selecionar ${inst.nome}`}
                          checked={instrumentosSelecionados.includes(inst.id)}
                          onChange={() => toggleInstrumento(inst.id)}
                        />
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        <p>Idade: {inst.idade}</p>
                        <p>Construto: {Array.isArray(inst.construtos) ? inst.construtos.join(", ") : inst.construtos}</p>
                        <p>Descrição: {inst.descricao}</p>
                        <p>Referência: {inst.referencia}</p>
                        <p>Áreas Profissionais: {inst.areasProfissionais.join(", ")}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Botões rodapé */}
        <div className="p-4 border-t flex justify-between gap-2">
          <button
            onClick={abrirModalAdicionar}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl"
          >
            Adicionar Novo Instrumento
          </button>
          <div className="flex gap-2">
            <button
              onClick={fechar}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-2xl"
            >
              Cancelar
            </button>
            <button
              onClick={adicionarInstrumentosSelecionados}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-2xl"
            >
              Adicionar
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
