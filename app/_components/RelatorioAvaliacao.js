"use client"

import { useState, useEffect } from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import FormPdfAvaliacao from "@/app/_components/FormPdfAvaliacao"
import { 
  salvarRelatorio, 
  buscarRelatorio, 
  getTodosInstrumentos, 
  getInstrumentosPaciente,
  removerInstrumentoRelatorio, 
  buscarPerguntasComRespostas
} from "@/app/_lib/actions"
import { gerarHistorico } from "@/app/_lib/ia-service"
import { Edit2, Trash2 } from "lucide-react"

// Sugestão automática para seções
async function gerarSugestao(secaoId, paciente) {

  // Queixa
  if (secaoId === 1) {
    const respostasAnamnese = await buscarPerguntasComRespostas(1, paciente.id)
    const resposta = respostasAnamnese.find(q => q.id_pergunta === 1)?.resposta
    return resposta && resposta.trim().length > 0
      ? resposta
      : "Exemplo: Paciente apresenta queixas relacionadas a dificuldades acadêmicas, como baixo rendimento escolar, desatenção frequente e esquecimento de instruções simples..."
  }

  // Histórico
  if (secaoId === 2) {
    const respostas = await buscarPerguntasComRespostas(1, paciente.id)
    const preenchidas = respostas.filter(r => r.resposta?.trim()).map(r => `${r.pergunta}: ${r.resposta}`).join("\n")
    if (!preenchidas) return "Exemplo: Desenvolvimento neuropsicomotor dentro do esperado para a idade..."
    try { return await gerarHistorico(preenchidas, paciente.idade) } 
    catch { alert("Erro ao preencher a sugestão"); return "" }
  }

  const sugestoes = {
    //Conclusao
    5: "Resultados indicam atenção preservada, algumas dificuldades em tarefas complexas..",
    //Hipoteses
    6: "TDAH leve..",
    //Coclusão
    7: "Sugere-se reforço escolar e acompanhamento psicopedagógico.."
  }

  return sugestoes[secaoId] || "Sugestão automática da IA."
}

function EditorCampo({ data, onChange, placeholder }) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={data || ""}
      config={{ 
        placeholder,
        toolbar: ['bold', 'italic', 'numberedList', 'bulletedList', 'link', 'undo', 'redo'],
        contentsCss: "body { color: black; }"
      }}
      onReady={editor => {
        editor.editing.view.change(writer => {
          const root = editor.editing.view.document.getRoot()
          writer.setStyle("min-height", "200px", root)
          writer.setStyle("max-height", "400px", root)
          writer.setStyle("overflow-y", "auto", root)
          writer.setStyle("color", "black", root)
        })
      }}
      onChange={(event, editor) => onChange(editor.getData())}
    />
  )
}

export default function RelatorioAvaliacao({ idPaciente, pacient }) {
  const [instrumentosSelecionados, setInstrumentosSelecionados] = useState([])
  const [instrumentosDisponiveis, setInstrumentosDisponiveis] = useState([])
  const [salvando, setSalvando] = useState(false)

  const secoesIniciais = [
    // { id: 1, titulo: "Identificação", conteudo: "" },
    { id: 1, titulo: "Queixa Principal", conteudo: "" },
    { id: 2, titulo: "Histórico (Anamnese)", conteudo: "" },
    { id: 3, titulo: "Instrumentos/Testes Aplicados", conteudo: "" },
    { id: 4, titulo: "Resultados de Instrumentos/Testes Aplicados", conteudo: "" },
    { id: 5, titulo: "Conclusão", conteudo: "" },
    { id: 6, titulo: "Hipóteses Diagnósticas", conteudo: "" },
    { id: 7, titulo: "Recomendações", conteudo: "" },
  ]
  const [secoes, setSecoes] = useState(secoesIniciais)

  // --- Carrega instrumentos disponíveis ---
  useEffect(() => {
    getTodosInstrumentos().then(setInstrumentosDisponiveis)
  }, [])

  // Carrega instrumentos do paciente e relatório salvo
  useEffect(() => {
  async function carregarDados() {
    try {
      // Buscar instrumentos do paciente
      const instrumentosPaciente = await getInstrumentosPaciente(idPaciente)

      // Buscar relatório salvo
      const relatorioSalvo = await buscarRelatorio(idPaciente)

      // Preencher todas as seções (incluindo seções não-instrumentos) com conteúdo salvo
      setSecoes(prev => prev.map(s => ({
        ...s,
        conteudo: relatorioSalvo.find(r => r.sessao === s.titulo)?.conteudo || ""
      })))

      // Preencher resultados dos instrumentos corretamente
      const instrumentosFormatados = instrumentosPaciente.map(i => {
        // Encontrar no relatório salvo a sessão que contenha o nome do instrumento
        const resultadoSalvo = relatorioSalvo.find(r => r.sessao.includes(i.nome))?.conteudo || ""
        return {
          id: i.id,
          nome: i.nome,
          descricao: i.descricao_completa || i.descricao,
          resultado: resultadoSalvo
        }
      })

      setInstrumentosSelecionados(instrumentosFormatados)
    } catch (err) {
      console.error("Erro ao carregar dados do paciente:", err)
      alert("Erro ao carregar os dados do paciente.")
    }
  }

  carregarDados()
}, [idPaciente])




  const atualizarConteudo = (id, valor) =>
    setSecoes(prev => prev.map(s => s.id === id ? { ...s, conteudo: valor } : s))
  const atualizarResultado = (instId, valor) => setInstrumentosSelecionados(prev => prev.map(i => i.id === instId ? { ...i, resultado: valor } : i))

  const adicionarInstrumento = (nome) => {
    const instr = instrumentosDisponiveis.find(i => i.nome === nome)
    if (!instrumentosSelecionados.find(i => i.nome === nome) && instr) {
      setInstrumentosSelecionados([...instrumentosSelecionados, { 
        id: Date.now() + Math.random(), 
        nome: instr.nome, 
        descricao: instr.descricao_completa || instr.descricao, 
        resultado: "" 
      }])
    }
  }

  const removerInstrumento = async (id, nome) => {
    if (await removerInstrumentoRelatorio(idPaciente, nome)) setInstrumentosSelecionados(prev => prev.filter(i => i.id !== id))
    else alert("Erro ao remover instrumento do banco.")
  }

  // Preencher sugestão do instrumento apenas ao clicar no botão
  const preencherSugestaoInstrumento = async (instNome) => {
  try {
    const instrumentosPaciente = await getInstrumentosPaciente(idPaciente)
    const instrumento = instrumentosPaciente.find(i => i.nome === instNome)

    setInstrumentosSelecionados(prev =>
      prev.map(i => i.nome === instNome 
        ? { 
            ...i, 
            resultado: instrumento?.resultado?.trim().length > 0
              ? instrumento.resultado
              : `Exemplo de resultado para o instrumento ${instNome}:\nPaciente apresentou desempenho compatível com a faixa etária, com algumas variações em atenção e memória de trabalho.`
          } 
        : i
      )
    )

  } catch (err) {
    console.error("Erro ao preencher sugestão do instrumento:", err)
    alert("Erro ao preencher sugestão do instrumento.")
  }
}


  const preencherSugestao = async (secaoId) => {
    const sugestao = await gerarSugestao(secaoId, pacient)
    atualizarConteudo(secaoId, sugestao)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSalvando(true)
    await salvarRelatorio(idPaciente, secoes, instrumentosSelecionados)
    setSalvando(false)
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 pb-40">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-white mb-8 px-6 py-4 bg-indigo-400 rounded-lg border border-indigo-700">
          Relatório de Avaliação
        </h2>

        <form id="formulario" onSubmit={handleSubmit} className="space-y-8">
          {secoes.map(s => (
            <section key={s.id} className="mb-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-indigo-700">{s.titulo}</h3>
                {s.id !== 4 && (
                  <button
                    type="button"
                    onClick={() => preencherSugestao(s.id)}
                    className="px-3 py-1 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 shadow flex items-center gap-2"
                  >
                    <Edit2 size={16} /> Preencher com Exemplo
                  </button>
                )}
              </div>

              {s.id === 4 ? (
                <div className="space-y-4">
                  <select
                    className="border p-3 rounded w-full text-gray-800"
                    onChange={e => {
                      if (e.target.value) { adicionarInstrumento(e.target.value); e.target.value = "" }
                    }}
                  >
                    <option value="">Adicionar instrumento</option>
                    {instrumentosDisponiveis.map((inst, idx) => (
                      <option key={idx} value={inst.nome}>{inst.nome}</option>
                    ))}
                  </select>

                  {instrumentosSelecionados.map(inst => (
                    <div key={inst.id} className="border rounded-xl p-4 shadow-sm bg-gray-50 space-y-3">
                      <div>
                        <strong className="text-gray-800 text-lg">{inst.nome}</strong>
                      </div>

                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => preencherSugestaoInstrumento(inst.nome)}
                          className="px-3 py-1 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 shadow flex items-center gap-2"
                        >
                          <Edit2 size={16} /> Preencher com Exemplo
                        </button>
                        <button
                          type="button"
                          onClick={() => removerInstrumento(inst.id, inst.nome)}
                          className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 shadow flex items-center gap-2"
                        >
                          <Trash2 size={16} /> Remover
                        </button>
                      </div>

                      <EditorCampo data={inst.resultado} onChange={data => atualizarResultado(inst.id, data)} placeholder={`Resultado do instrumento ${inst.nome}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <EditorCampo data={s.conteudo} onChange={data => atualizarConteudo(s.id, data)} placeholder="Digite aqui..." />
              )}
            </section>
          ))}
        </form>

        <div className="bg-white border-t border-gray-300 p-4 flex justify-end gap-4 shadow-lg rounded-xl"
             style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '90%', zIndex: 1000 }}>
          <button type="submit" form="formulario" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition">
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <PDFDownloadLink
            document={<FormPdfAvaliacao secoes={secoes} instrumentos={instrumentosSelecionados} pacient={pacient} />}
            fileName="relatorio-avaliacao.pdf"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition flex items-center justify-center"
          >
            {({ loading }) => (loading ? 'Gerando PDF...' : 'Baixar PDF')}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  )
}
