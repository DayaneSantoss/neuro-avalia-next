"use client"

import { useState, useRef, useEffect } from "react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import { salvarDetalhesInstrumento, buscarDetalhesInstrumento, deletarArquivoDaSessao } from "@/app/_lib/actions"

export default function ModalInstrumentoDetalhe({ sessaoSelecionada, aberto, fechar, instrumento, paciente }) 
{
  const [conteudo, setConteudo] = useState("")
  const [arquivos, setArquivos] = useState([])
  // const [gravando, setGravando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState("instruções")

  // const mediaRecorderRef = useRef(null)
  // const audioChunksRef = useRef([])

  // Carregar dados do banco quando o modal abre
useEffect(() => {
  if (!aberto || !sessaoSelecionada || !instrumento) return;

  let ativo = true; // flag para evitar setState após o modal fechar

  const carregarDados = async () => {
    try {
      const dados = await buscarDetalhesInstrumento(sessaoSelecionada.id, instrumento.id);
      // console.log(dados)

      if (dados && ativo) {
        setConteudo(dados.resultado); // mantém vazio se nulo

        const arquivosExistentes = [
          ...(dados.arquivos).map(f => ({
            ...f,
            type: "file",
            file: null, // só referência ao banco
            observacao: f.comentario,
            id: f.id,
            url: f.caminho_arquivo
          }))
          // ,
          // ...(dados.audios).map(f => ({
          //   ...f,
          //   type: "audio",
          //   file: null,
          //   observacao: f.comentario,
          //   id: f.id,
          //   url: f.caminho_arquivo
          // }))
        ];

        setArquivos(arquivosExistentes);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  carregarDados();

  return () => { ativo = false }; // cancela atualizações se modal fechar
}, [aberto, sessaoSelecionada?.id, instrumento?.id]);


  // Adicionar novos arquivos
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("audio") ? "audio" : "file",
      observacao: ""
    }))
    setArquivos(prev => [...prev, ...newFiles])
  }

  // Remover arquivo ou áudio
  const removerArquivo = async (index) => {
  const f = arquivos[index];
  if (!f) return;

  try {
    if (f.id) {
      await deletarArquivoDaSessao(f.id, sessaoSelecionada.id, instrumento.id);
    }
    if (f.file && f.url) URL.revokeObjectURL(f.url);

    setArquivos(prev => prev.filter((_, i) => i !== index));
  } catch (err) {
    console.error("Erro ao remover arquivo:", err);
    alert("Erro ao remover arquivo. Veja o console para detalhes.");
  }
};

  // Atualizar observação
  const atualizarArquivo = (index, valor) => {
    setArquivos(prev => {
      const copia = [...prev]
      copia[index].observacao = valor
      return copia
    })
  }

  // // Iniciar gravação
  // const iniciarGravacao = async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  //   const mediaRecorder = new MediaRecorder(stream)
  //   mediaRecorderRef.current = mediaRecorder
  //   audioChunksRef.current = []

  //   mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data)
  //   mediaRecorder.onstop = () => {
  //     const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
  //     const audioFile = new File([audioBlob], `Gravacao_${Date.now()}.webm`, { type: "audio/webm" })
  //     setArquivos(prev => [...prev, { file: audioFile, url: URL.createObjectURL(audioFile), type: "audio", observacao: "" }])
  //   }

  //   mediaRecorder.start()
  //   setGravando(true)
  // }

  // const pararGravacao = () => {
  //   if (mediaRecorderRef.current) {
  //     mediaRecorderRef.current.stop()
  //     mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
  //   }
  //   setGravando(false)
  // }

  // Salvar dados no banco
  const salvarConteudo = async () => {
  if (!sessaoSelecionada || !instrumento || !paciente) return;

  try {
    const formData = new FormData();
    formData.append("sessaoId", sessaoSelecionada.id);
    formData.append("instrumentoId", instrumento.id);
    formData.append("pacienteId", paciente.id);
    formData.append("instrumentoNome", instrumento.nome);
    formData.append("conteudo", conteudo);

    // Arquivos novos
    arquivos.forEach((f, index) => {
      if (f.file instanceof File) {
        formData.append("arquivos", f.file); // arquivo físico
        formData.append(`observacoesNovos[${index}]`, f.observacao || ""); // observação
        formData.append(`tiposNovos[${index}]`, f.type); // tipo: audio ou file
      }
    });

    // Arquivos existentes (com ID) -> atualizar comentario
    const arquivosExistentes = arquivos
      .filter(f => f.id)
      .map(f => ({ id: f.id, comentario: f.observacao || "" }));
    
    formData.append("arquivosExistentes", JSON.stringify(arquivosExistentes));

    await salvarDetalhesInstrumento(formData);
    fechar();
  } catch (err) {
    console.error("Erro ao salvar instrumento:", err);
    alert("Erro ao salvar instrumento. Veja o console para detalhes.");
  }
};



  // Aplicar descrição completa
  const aplicarDescricaoCompleta = () => {
    if (instrumento.descricao_completa) {
      const tabela = `
        <br/><strong>Tabela de Pontuação Técnica</strong>
        <table border="1" style="border-collapse:collapse;width:100%;text-align:center;">
          <thead>
            <tr><th>Área</th><th>Escore</th><th>Pontuação</th><th>Classificação</th></tr>
          </thead>
          <tbody>
            <tr><td>Área 1</td><td>...</td><td>...</td><td>...</td></tr>
            <tr><td>Área 2</td><td>...</td><td>...</td><td>...</td></tr>
          </tbody>
        </table>
        <p><strong>Referência:</strong> &lt;70 - Muito Baixa; 70-84 - Baixa; 115-129 - Alta; &gt; 130 - Muito Alta</p>
      `
      setConteudo(`${instrumento.descricao_completa}${tabela}`)
    }
  }

  if (!aberto || !instrumento || !sessaoSelecionada) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-[90vw] max-w-7xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <h2 className="text-2xl font-bold text-gray-800">{instrumento.nome}</h2>
        </div>

        {/* Abas */}
        <div className="flex justify-center gap-4 border-b px-6 py-3 bg-gray-50">
          {["resultado","arquivos","instruções"].map(tab => (
            <button
              key={tab}
              onClick={() => setAbaAtiva(tab)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 border-2
                ${abaAtiva===tab 
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow-lg scale-105 hover:scale-110" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600 hover:scale-105"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* Instruções */}
          {abaAtiva==="instruções" && (
            <div className="p-6 bg-gray-50 rounded-2xl shadow-inner h-full overflow-y-auto">
              <h3 className="text-lg font-semibold mb-3 text-indigo-700">Instruções do Teste</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Leia atentamente todas as instruções antes de iniciar o teste.</li>
                <li>Garanta que o paciente esteja confortável e sem distrações.</li>
                <li>Preencha os campos de resultados ou observações conforme o teste for aplicado.</li>
                <li>Você pode anexar arquivos complementares ou gravar áudio das observações.</li>
                <li>Ao terminar, clique em &quot;Salvar&quot; para registrar todos os dados.</li>
              </ul>
            </div>
          )}

          {/* Resultado com CKEditor */}
          {abaAtiva==="resultado" && (
  <div className="p-4 bg-gray-50 rounded-2xl shadow-inner flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h3 className="text-lg font-semibold text-gray-800">Resultado</h3>
      <p className="text-gray-600 text-sm">
        Preencha este campo com os resultados observados durante a aplicação do teste. Use o botão &quot;Aplicar Descrição Completa&quot; para carregar automaticamente a descrição técnica do instrumento.
      </p>
    </div>
    <div className="flex justify-end">
      <button
        onClick={aplicarDescricaoCompleta}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition transform hover:scale-105 shadow-md hover:shadow-lg"
      >Aplicar Descrição Completa</button>
    </div>

    <div className="border border-gray-300 rounded-xl bg-white shadow-sm text-black hover:shadow-md transition">
      <CKEditor
        key={`${sessaoSelecionada.id}_${instrumento.id}`} 
        editor={ClassicEditor}
        data={conteudo ?? ""}   
        onReady={editor => {
          const editableElement = editor.ui.view.editable.element
          editableElement.style.height = '500px'
        }}
        onChange={(e, editor) => setConteudo(editor.getData())}
      />
    </div>
    </div>
    )}


          {/* Arquivos */}
          {abaAtiva==="arquivos" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl shadow-inner">
                <label className="block text-gray-700 font-semibold mb-2">Anexar Arquivos</label>
                <label className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl cursor-pointer transition transform hover:scale-105 shadow hover:shadow-lg">
                  Adicionar Arquivo
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
                <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
                  {arquivos.filter(f=>f.type==="file").length===0
                    ? <p className="text-gray-500 text-sm text-center">Nenhum arquivo adicionado.</p>
                    : arquivos.filter(f=>f.type==="file").map((f,i)=>(
                        <div key={i} className="p-3 bg-white rounded-2xl shadow hover:shadow-xl transition transform flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <a href={f.url} download={f.file?.name || f.url.split("/").pop()} className="text-indigo-600 hover:underline truncate font-medium">{f.file?.name || f.url.split("/").pop()}</a>
                            <button onClick={()=>removerArquivo(i)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                          </div>
                          <textarea value={f.observacao} onChange={e=>atualizarArquivo(i,e.target.value)}
                            rows="2" className="w-full border border-gray-300 rounded-xl p-2 resize-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition text-black"
                            placeholder="Adicione uma observação descritiva sobre o arquivo."/>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* Áudios
          {abaAtiva==="audios" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl shadow-inner">
                {gravando
                  ? <button className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-2xl shadow transition transform hover:scale-105 hover:shadow-lg" onClick={pararGravacao}>Parar Gravação</button>
                  : <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl shadow transition transform hover:scale-105 hover:shadow-lg" onClick={iniciarGravacao}>Iniciar Gravação</button>
                }
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {arquivos.filter(f=>f.type==="audio").length===0
                  ? <p className="text-gray-500 text-sm text-center">Nenhum áudio gravado.</p>
                  : arquivos.filter(f=>f.type==="audio").map((f,i)=>(
                      <div key={i} className="p-3 bg-white rounded-2xl shadow hover:shadow-xl transition transform flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <audio controls className="flex-1 mr-2"><source src={f.url} type="audio/webm" /></audio>
                          <button onClick={()=>removerArquivo(i)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                        </div>
                        <textarea value={f.observacao} onChange={e=>atualizarArquivo(i,e.target.value)}
                          rows="2" className="w-full border border-gray-300 rounded-xl p-2 resize-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                          placeholder="Adicione uma observação sobre a gravação."/>
          
                      </div>
                    ))
                }
              </div>
            </div> */}
          {/* ) */}
          {/* } */}

        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-white rounded-b-2xl">
          <button onClick={fechar} className="px-5 py-2 bg-gray-400 hover:bg-gray-500 rounded-2xl text-white transition transform hover:scale-105 shadow hover:shadow-lg">Fechar</button>
          <button onClick={salvarConteudo} className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-2xl text-white transition transform hover:scale-105 shadow hover:shadow-lg">Salvar</button>
        </div>

      </div>
    </div>
  )
}
