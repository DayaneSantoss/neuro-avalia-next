"use client"

import { useState, useEffect } from "react"
import { File, FileText, Eye, Edit2, Trash2, PlusCircle, Download } from "lucide-react"
import Image from "next/image"
import { salvarArquivoPaciente, getArquivosPaciente, excluirArquivoPaciente, atualizarArquivoPaciente } from "@/app/_lib/actions" 

export default function GerenciadorArquivos({ arquivosIniciais, pacienteId}) {
  const [arquivos, setArquivos] = useState(arquivosIniciais)
  const [modalAberto, setModalAberto] = useState(false)
  const [arquivoEditando, setArquivoEditando] = useState(null)
  const [novoArquivo, setNovoArquivo] = useState(null)
  const [titulo, settitulo] = useState("")
  const [comentario, setComentario] = useState("")
  const [visualizarArquivo, setVisualizarArquivo] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const data = await getArquivosPaciente(pacienteId)
      setArquivos(data)
    }
    fetchData()
  }, [pacienteId])

  const abrirModal = (arquivo = null) => {
    if (arquivo) {
      setArquivoEditando(arquivo)
      setNovoArquivo(arquivo.arquivo)
      settitulo(arquivo.titulo)
      setComentario(arquivo.comentario)
    }
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setArquivoEditando(null)
    setNovoArquivo(null)
    settitulo("")
    setComentario("")
  }

  const handleDownload = async (url, nome) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = nome
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error)
      alert("Erro ao baixar arquivo")
    }
  }

  const removerArquivo = async (arquivo) => {
    if (!confirm("Deseja realmente excluir este arquivo?")) return;

    try {
      await excluirArquivoPaciente(arquivo);
        setArquivos(prev => prev.filter(a => a.id !== arquivo.id));
    } catch (err) {
      console.error("Erro ao excluir arquivo:", err);
      alert("Erro ao excluir arquivo");
    }
  };


const salvarArquivo = async () => {
  // Verifica se tem arquivo
  if (!novoArquivo && !arquivoEditando) return alert("Selecione um arquivo")

  try {
    const formData = new FormData()

    // Se for novo arquivo, adiciona ao formData
    if (novoArquivo && novoArquivo.name && novoArquivo.size !== undefined) {
      formData.append("caminho_arquivo", novoArquivo)
    }

    formData.append("titulo", titulo)
    formData.append("comentario", comentario)

    let result

    // ===== Atualizando arquivo existente =====
    if (arquivoEditando) {
      result = await atualizarArquivoPaciente(arquivoEditando.id, formData)

      if (!result.ok) {
        console.error(result.error)
        return alert("Erro ao atualizar arquivo: " + result.error)
      }

      // Atualiza o state com os dados retornados do backend
      setArquivos(prev =>
        prev.map(a => a.id === arquivoEditando.id ? { ...a, ...result.data } : a)
      )
    } 

    // ===== Salvando novo arquivo =====
    else {
      result = await salvarArquivoPaciente(formData, pacienteId)

      if (!result.ok) {
        console.error(result.error)
        return alert("Erro ao salvar arquivo: " + result.error)
      }

      // Adiciona o novo arquivo ao state usando os dados completos retornados
      setArquivos(prev => [...prev, result.data])
    }

    // Fecha o modal
    fecharModal()

  } catch (err) {
    console.error("Erro ao salvar no BD:", err)
    if (err?.message) console.error("Mensagem:", err.message)
    if (err?.code) console.error("Código:", err.code)
    if (err?.details) console.error("Detalhes:", err.details)
    if (err?.hint) console.error("Hint:", err.hint)

    alert("Erro ao salvar no banco")
  }
}




  // const removerArquivo = (id) => setArquivos(prev => prev.filter(a => a.id !== id))

  const renderIcon = (arquivo) => {
    if (arquivo.tipo?.startsWith("image/")) {
      return <Image src={arquivo.url} width={40} height={40} className="rounded mr-3" alt="Arquivo" />
    } else if (arquivo.tipo === "application/pdf") {
      return <FileText className="w-10 h-10 text-red-300 mr-3" />
    } else if (arquivo.tipo?.startsWith("text/")) {
      return <FileText className="w-10 h-10 text-yellow-300 mr-3" />
    } else {
      return <File className="w-10 h-10 text-gray-300 mr-3" />
    }
  }

  return (
    <div className="py-10 px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-indigo-400 rounded-3xl px-8 py-4 mb-10 shadow-md">
        <h1 className="text-2xl font-bold text-white">Gerenciador de Arquivos</h1>
        <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-indigo-200 hover:bg-indigo-300 text-indigo-800 px-4 py-2 rounded-2xl">
          <PlusCircle size={18} /> Adicionar Arquivo
        </button>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-4 py-10 ">
        {arquivos.length === 0 ? (
          <p className="text-gray-500 text-center py-20">Ainda não foram adicionados arquivos.</p>
        ) : (
          arquivos.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-2xl shadow flex justify-between items-center">
              <div className="flex items-center">
                {renderIcon(a)}
                <div>
                  <p className="font-semibold text-gray-800">{a.titulo}</p>
                  <p className="text-gray-700 text-sm font-semibold">{a.nome_arquivo}</p>
                  <p className="text-gray-800 text-sm">{a.comentario}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {a.tipo === "application/pdf" && (
                  <button onClick={() => setVisualizarArquivo(a)} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-2xl">
                    <Eye size={16} /> Visualizar
                  </button>
                )}
                <a
                  // href={a.arquivo}
                  // download={a.arquivo}
                  // target="_blank"
                  // rel="noopener noreferrer"
                  onClick={() => handleDownload(a.caminho_arquivo, a.nome_arquivo)}
                  className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-2xl"
                >
                  <Download size={16} /> Baixar
                </a>
                <button onClick={() => abrirModal(a)} className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-2xl">
                  <Edit2 size={16} /> Editar
                </button>
                <button onClick={() => removerArquivo(a)} className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-2xl">
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
            <h2 className="text-xl font-semibold text-indigo-700">{arquivoEditando ? "Editar" : "Adicionar"}</h2>

            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 rounded-2xl p-4 cursor-pointer hover:bg-indigo-50">
              <PlusCircle className="text-indigo-500" size={20} />
              <span className="text-indigo-700">{novoArquivo ? novoArquivo.name : "Escolher arquivo"}</span>
              <input type="file" onChange={e => setNovoArquivo(e.target.files[0])} className="hidden" />
            </label>

            <input
              type="text"
              placeholder="Titulo"
              value={titulo}
              onChange={e => settitulo(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl p-3 text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none transition=resize-y overflow-y-auto"
            />
            <textarea
              placeholder="Comentário"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl p-3 text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none transition=resize-y overflow-y-auto"
              rows={3}
            ></textarea>

            <div className="flex justify-end gap-2">
              <button onClick={fecharModal} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl">Cancelar</button>
              <button onClick={salvarArquivo} className="px-4 py-2 bg-indigo-300 text-indigo-700 rounded-xl">
                {arquivoEditando ? "Salvar Alterações" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF fullscreen */}
      {visualizarArquivo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
          <button onClick={() => setVisualizarArquivo(null)} className="mb-4 px-4 py-2 bg-red-200 text-red-800 rounded-xl">Fechar</button>
          <iframe src={visualizarArquivo.caminho_arquivo} className="w-full h-full rounded-2xl shadow-lg" />
        </div>
      )}
    </div>
  )
}
