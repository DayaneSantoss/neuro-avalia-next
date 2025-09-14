"use client"

import { useState, useMemo } from "react"
import { File, FileText, Eye, Edit2, Trash2, PlusCircle, Download } from "lucide-react"
import Image from "next/image";

export default function GerenciadorContratos({ contratosIniciais = [] }) {
  const [contratos, setContratos] = useState(contratosIniciais)
  const [modalAberto, setModalAberto] = useState(false)
  const [contratoEditando, setContratoEditando] = useState(null)
  const [novoArquivo, setNovoArquivo] = useState(null)
  const [descricao, setDescricao] = useState("")
  const [comentario, setComentario] = useState("")
  const [tipoContrato, setTipoContrato] = useState("")
  const [tipoContratoManual, setTipoContratoManual] = useState("")
  const [dataAssinatura, setDataAssinatura] = useState("")
  const [vigencia, setVigencia] = useState("")
  const [statusContrato, setStatusContrato] = useState("Ativo")
  const [visualizarContrato, setVisualizarContrato] = useState(null)
  const [busca, setBusca] = useState("")

  // Filtra contratos pela busca
  const contratosFiltrados = useMemo(() => {
    return contratos.filter(c =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (c.tipoContrato && c.tipoContrato.toLowerCase().includes(busca.toLowerCase()))
    )
  }, [contratos, busca])

  const abrirModal = (contrato = null) => {
    if (contrato) {
      setContratoEditando(contrato)
      setNovoArquivo(contrato.arquivo)
      setDescricao(contrato.descricao)
      setComentario(contrato.comentario)
      if (["Prestação de Serviços","Avaliação e Diagnóstico","Consultoria/Supervisão","Confidencialidade (NDA)","Parceria/Convênio","Sessão Avulsa/Pacote de Sessões","Autorização de Uso de Imagem/Material"].includes(contrato.tipoContrato)) {
        setTipoContrato(contrato.tipoContrato)
        setTipoContratoManual("")
      } else {
        setTipoContrato("Outro")
        setTipoContratoManual(contrato.tipoContrato)
      }
      setDataAssinatura(contrato.dataAssinatura)
      setVigencia(contrato.vigencia)
      setStatusContrato(contrato.statusContrato)
    }
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setContratoEditando(null)
    setNovoArquivo(null)
    setDescricao("")
    setComentario("")
    setTipoContrato("")
    setTipoContratoManual("")
    setDataAssinatura("")
    setVigencia("")
    setStatusContrato("Ativo")
  }

  const salvarContrato = () => {
    const tipoFinal = tipoContrato === "Outro" ? tipoContratoManual : tipoContrato
    if (!novoArquivo || !tipoFinal || !dataAssinatura) return alert("Preencha os campos obrigatórios")

    if (contratoEditando) {
      setContratos(prev =>
        prev.map(c =>
          c.id === contratoEditando.id
            ? { ...c, arquivo: novoArquivo, nome: novoArquivo.name, descricao, comentario, tipoContrato: tipoFinal, dataAssinatura, vigencia, statusContrato, tipo: novoArquivo.type }
            : c
        )
      )
    } else {
      setContratos(prev => [
        ...prev,
        { id: Date.now(), arquivo: novoArquivo, nome: novoArquivo.name, tipo: novoArquivo.type, descricao, comentario, tipoContrato: tipoFinal, dataAssinatura, vigencia, statusContrato }
      ])
    }
    fecharModal()
  }

  const removerContrato = (id) => setContratos(prev => prev.filter(c => c.id !== id))

  const renderIcon = (contrato) => {
    if (contrato.tipo.startsWith("image/")) {
      return <Image src={URL.createObjectURL(contrato.arquivo)} className="w-10 h-10 object-cover rounded mr-3" alt="Imagem do contrato" fill/>
    } else if (contrato.tipo === "application/pdf") {
      return <FileText className="w-10 h-10 text-red-300 mr-3" />
    } else {
      return <File className="w-10 h-10 text-gray-300 mr-3" />
    }
  }

  // Resumo geral
  const resumo = useMemo(() => {
    const total = contratos.length
    const ativos = contratos.filter(c => c.statusContrato === "Ativo").length
    const expirados = contratos.filter(c => c.statusContrato === "Expirado").length
    const cancelados = contratos.filter(c => c.statusContrato === "Cancelado").length
    return { total, ativos, expirados, cancelados }
  }, [contratos])

  return (
    <div className="py-10 px-8 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-indigo-400 border border-indigo-200 rounded-3xl px-8 py-4 mb-6 shadow-md">
        <h1 className="text-2xl font-bold text-white rounded-lg">Gerenciador de Contratos</h1>
        <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-indigo-200 hover:bg-indigo-300 text-indigo-800 px-4 py-2 rounded-2xl transition">
          <PlusCircle size={18} /> Adicionar Contrato
        </button>
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar contrato..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="w-full mb-6 p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {/* Resumo */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="bg-indigo-100 text-indigo-700 p-4 rounded-2xl shadow w-40 text-center">Total: {resumo.total}</div>
        <div className="bg-green-100 text-green-700 p-4 rounded-2xl shadow w-40 text-center">Ativos: {resumo.ativos}</div>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-2xl shadow w-40 text-center">Expirados: {resumo.expirados}</div>
        <div className="bg-red-100 text-red-700 p-4 rounded-2xl shadow w-40 text-center">Cancelados: {resumo.cancelados}</div>
      </div>

      {/* Lista de contratos */}
      <div className="flex flex-col gap-4 py-4">
        {contratosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-center py-20">Ainda não foram adicionados contratos.</p>
        ) : (
          contratosFiltrados.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-2xl shadow flex justify-between items-center hover:shadow-md transition">
              <div className="flex items-center">
                {renderIcon(c)}
                <div>
                  <p className="font-semibold text-gray-800">{c.nome}</p>
                  <p className="text-gray-500 text-sm">{c.descricao}</p>
                  <p className="text-gray-400 text-xs">{c.comentario}</p>
                  <p className="text-indigo-600 text-sm font-medium">{c.tipoContrato} - {c.statusContrato}</p>
                  <p className="text-gray-500 text-xs">Assinado em: {c.dataAssinatura} | Vigência: {c.vigencia || "N/A"}</p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-2">
                {c.tipo === "application/pdf" && (
                  <button onClick={() => setVisualizarContrato(c)} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-2xl hover:bg-blue-200 transition">
                    <Eye size={16} /> Visualizar
                  </button>
                )}
                <a
                  href={URL.createObjectURL(c.arquivo)}
                  download={c.nome}
                  className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-2xl hover:bg-indigo-200 transition"
                >
                  <Download size={16} /> Baixar
                </a>
                <button onClick={() => abrirModal(c)} className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-2xl hover:bg-yellow-200 transition">
                  <Edit2 size={16} /> Editar
                </button>
                <button onClick={() => removerContrato(c.id)} className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-2xl hover:bg-red-200 transition">
                  <Trash2 size={16} /> Remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold text-indigo-700">{contratoEditando ? "Editar" : "Adicionar"}</h2>

            {/* Arquivo */}
            <div className="w-full">
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 rounded-2xl p-4 cursor-pointer hover:bg-indigo-50 transition">
                <PlusCircle className="text-indigo-500" size={20} />
                <span className="text-indigo-700">{novoArquivo ? novoArquivo.name : "Escolher arquivo"}</span>
                <input type="file" onChange={e => setNovoArquivo(e.target.files[0])} className="hidden" />
              </label>
            </div>

            {/* Tipo de contrato */}
            <div className="w-full flex flex-col gap-2">
              <select
                value={tipoContrato}
                onChange={e => setTipoContrato(e.target.value)}
                className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl"
              >
                <option value="">Selecione o tipo</option>
                <option value="Prestação de Serviços">Prestação de Serviços</option>
                <option value="Avaliação e Diagnóstico">Avaliação e Diagnóstico</option>
                <option value="Consultoria/Supervisão">Consultoria/Supervisão</option>
                <option value="Confidencialidade (NDA)">Confidencialidade (NDA)</option>
                <option value="Parceria/Convênio">Parceria/Convênio</option>
                <option value="Sessão Avulsa/Pacote de Sessões">Sessão Avulsa/Pacote de Sessões</option>
                <option value="Autorização de Uso de Imagem/Material">Autorização de Uso de Imagem/Material</option>
                <option value="Outro">Outro</option>
              </select>
              {tipoContrato === "Outro" && (
                <input
                  type="text"
                  placeholder="Digite o tipo de contrato"
                  value={tipoContratoManual}
                  onChange={e => setTipoContratoManual(e.target.value)}
                  className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl"
                />
              )}
            </div>

            {/* Campos adicionais */}
            <input type="date" placeholder="Data de Assinatura" value={dataAssinatura} onChange={e => setDataAssinatura(e.target.value)} className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl" />
            <input type="text" placeholder="Vigência" value={vigencia} onChange={e => setVigencia(e.target.value)} className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl" />
            <select value={statusContrato} onChange={e => setStatusContrato(e.target.value)} className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl">
              <option>Ativo</option>
              <option>Expirado</option>
              <option>Cancelado</option>
            </select>
            <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl" />
            <textarea placeholder="Comentário" value={comentario} onChange={e => setComentario(e.target.value)} className="w-full border rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl" rows={3}></textarea>

            <div className="flex justify-end gap-2">
              <button onClick={fecharModal} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 transition">Cancelar</button>
              <button onClick={salvarContrato} className="px-4 py-2 bg-indigo-300 text-indigo-700 rounded-xl hover:bg-indigo-200 transition">{contratoEditando ? "Salvar Alterações" : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Visualização */}
      {visualizarContrato && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
          <button onClick={() => setVisualizarContrato(null)} className="mb-4 px-4 py-2 bg-red-200 text-red-800 rounded-xl hover:bg-red-300 transition">Fechar</button>
          <iframe src={URL.createObjectURL(visualizarContrato.arquivo)} className="w-full h-full rounded-2xl shadow-lg" />
        </div>
      )}
    </div>
  )
}
