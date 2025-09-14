"use client"

import { useState , useEffect} from "react"
import ModalInstrumentos from "@/app/_components/ModalInstrumentos"
import ModalInstrumentoDetalhe from "@/app/_components/ModalInstrumentoDetalhe"
import ResumoSessoes from "@/app/_components/ResumoSessoes";
import { Trash2, Eye,  PlusCircle} from "lucide-react";
import { getSessoes, criarSessao, atualizarSessaoBD as atualizarSessaoNoBD, excluirSessao as excluirSessaoBD } from "@/app/_lib/actions"



export default function SessoesPaciente({ hipoteses, instrumentosbd, idadePaciente, paciente}) {
  const [sessoes, setSessoes] = useState([])
  const [areasProfissionaisFiltro, setAreasProfissionaisFiltro] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [construtosFiltro, setConstrutosFiltro] = useState([])


  const [form, setForm] = useState({
    serie: false,
    quantidade: 1,
    diasEntre: 1,
    data: "",
    hora_inicio: "",
    valor: "",
  })

  const [modalAdicionarInstrumentosAberto, setModalAdicionarInstrumentosAberto] = useState(false)
  const [modalInstrumentoAberto, setModalInstrumentoAberto] = useState(false)
  const [instrumentoAtual, setInstrumentoAtual] = useState(null)
  const [sessaoSelecionada, setSessaoSelecionada] = useState(null)
  const [instrumentosSelecionados, setInstrumentosSelecionados] = useState([])
  const [idadeFiltro, setIdadeFiltro] = useState(idadePaciente) 
  const [areasFiltro, setAreasFiltro] = useState([])
  const [idadeSessao, setIdadeSessao] = useState(idadePaciente)
  const [instrumentosDisponiveis, setInstrumentosDisponiveis] = useState(instrumentosbd)

  useEffect(() => {
  const fetchSessoes = async () => {
    try {
      const data = await getSessoes(paciente.id)  
      setSessoes(data)
    } catch (error) {
      console.error("Erro ao carregar sessões:", error)
    }
  }
  fetchSessoes()
}, [paciente.id])


  const excluirSessao = async (id) => {
  try {
    await excluirSessaoBD(id)
    setSessoes(sessoes.filter(s => s.id !== id))
  } catch (error) {
    console.error("Erro ao excluir sessão:", error)
  }
}


  const verificarIdade = (idadeSelecionada, faixa) => {
    const idade = idadeSelecionada 
    if (faixa.includes("+")) {
      const min = Number(faixa.replace("+", ""))
      return idade >= min
    } else if (faixa.includes("-")) {
      const [min, max] = faixa.split("-").map(Number)
      return idade >= min && idade <= max
    }
    return idade === Number(faixa)
  }

  
  const atualizarSessao = async (sessaoId, campo, valor) => {
    setSessoes(prevSessoes =>
      prevSessoes.map(s => s.id === sessaoId ? { ...s, [campo]: valor } : s)
    )

    const sessaoAtual = sessoes.find(s => s.id === sessaoId) || {}
    const formAtualizado = { ...sessaoAtual, [campo]: valor }

    try {
      await atualizarSessaoNoBD({
        sessaoId,
        form: {
          data: formAtualizado.data,
          hora_inicio: formAtualizado.hora_inicio,
          hora_fim: formAtualizado.hora_fim,
          valor: formAtualizado.valor ? Number(formAtualizado.valor) : null,
          presenca: formAtualizado.presenca,
          status_pagamento: formAtualizado.status_pagamento,
          observacoes: formAtualizado.observacoes,
          progresso: formAtualizado.progresso,
          comportamento: formAtualizado.comportamento,
          recomendacoes: formAtualizado.recomendacoes
        },
        instrumentos: formAtualizado.instrumentos || [],
        hipoteses: formAtualizado.hipoteses || [],
      })
    } catch (error) {
      console.error("Erro ao atualizar sessão no banco:", error)
    }
  }


  // ------- CRUD Sessão -------
  const abrirModal = () => setModalAberto(true)
  const fecharModal = () => {
    setModalAberto(false)
    setEditandoId(null)

  }

  const salvarSessao = async () => {
    
  if (!paciente.id) {
    console.error("pacienteId não definido!");
    return;
  }

  try {
    if (editandoId) {
      const sessaoAtualizada = await atualizarSessaoNoBD({
        sessaoId: editandoId,
        form,
        instrumentos: instrumentosSelecionados,
        hipoteses: sessaoSelecionada?.hipoteses || [],
      });
      setSessoes(sessoes.map(s => s.id === editandoId ? sessaoAtualizada : s));
    } else {
      const novasSessoes = [];
      if (form.serie) {
        let dataAtual = new Date(form.data);
        for (let i = 0; i < form.quantidade; i++) {
          const nova = await criarSessao({
            pacienteId: paciente.id,
            form: { ...form, data: dataAtual.toISOString().split("T")[0] },
            instrumentos: instrumentosSelecionados,
            hipoteses: sessaoSelecionada?.hipoteses || []
          });
          novasSessoes.push(nova);
          dataAtual.setDate(dataAtual.getDate() + form.diasEntre);
        }
      } else {
        const nova = await criarSessao({
          pacienteId: paciente.id,
          form,
          instrumentos: instrumentosSelecionados,
          hipoteses: sessaoSelecionada?.hipoteses || []
        });
        novasSessoes.push(nova);
      }

      setSessoes([...sessoes, ...novasSessoes]);
    }

    fecharModal();
  } catch (error) {
    console.error("Erro ao salvar sessão:", error);
  }
};



  // ------- Hipóteses na sessão (UI) -------
  const adicionarHipoteseNaSessao = async (sessaoId, hipId) => {
  if (!hipId) return;

  setSessoes(prev =>
    prev.map(s =>
      s.id === sessaoId
        ? { ...s, hipoteses: [...new Set([...(s.hipoteses || []), hipId])] }
        : s
    )
  );

  const sessaoAtual = sessoes.find(s => s.id === sessaoId);
  const novasHipoteses = [...new Set([...(sessaoAtual?.hipoteses || []), hipId])];

  try {
    await atualizarSessaoNoBD({
      sessaoId,
      form: sessaoAtual,
      hipoteses: novasHipoteses
    });
  } catch (err) {
    console.error("Erro ao salvar hipótese:", err);
  }
};

const removerHipoteseDaSessao = async (sessaoId, hipId) => {
  setSessoes(prev =>
    prev.map(s =>
      s.id === sessaoId
        ? { ...s, hipoteses: (s.hipoteses || []).filter(h => h !== hipId) }
        : s
    )
  );

  const sessaoAtual = sessoes.find(s => s.id === sessaoId);
  const novasHipoteses = (sessaoAtual?.hipoteses || []).filter(h => h !== hipId);

  try {
    await atualizarSessaoNoBD({
      sessaoId,
      form: sessaoAtual,
      hipoteses: novasHipoteses
    });
  } catch (err) {
    console.error("Erro ao remover hipótese:", err);
  }
};


  // ------- Modal Instrumentos -------
  const abrirModalAdicionarInstrumentos = (sessao) => {
    setSessaoSelecionada(sessao)
    // setIdadeFiltro() //15 default
    setAreasFiltro([])

    // Pré-seleciona instrumentos recomendados com base nas hipóteses da sessão
    const recomendados = []
    if (sessao.hipoteses?.length) {
      const hips = hipoteses.filter(h => sessao.hipoteses.includes(h.id))
      hips.forEach(h => h.construtos.forEach(t => recomendados.push(t)))
    }
    setInstrumentosSelecionados([...sessao.instrumentos || []])
    setModalAdicionarInstrumentosAberto(true)
  }

  const abrirModalInstrumento = (sessao, instrumentoObj) => {
  setSessaoSelecionada(sessao)       // garante que a sessão esteja definida
  setInstrumentoAtual(instrumentoObj) // agora é objeto completo
  setModalInstrumentoAberto(true)
}

  const fecharModalInstrumento = () => {
    setInstrumentoAtual(null)
    setModalInstrumentoAberto(false)
  }

  const fecharModalAdicionarInstrumentos = () => setModalAdicionarInstrumentosAberto(false)
  // const fecharModalInstrumentos = () => setModalInstrumentosAberto(false)

  const toggleInstrumento = (instrumentoId) => {
  if (instrumentosSelecionados.includes(instrumentoId)) {
    setInstrumentosSelecionados(instrumentosSelecionados.filter(id => id !== instrumentoId));
  } else {
    setInstrumentosSelecionados([...instrumentosSelecionados, instrumentoId]);
  }
};


  const adicionarInstrumentosSelecionados = () => {
    if (sessaoSelecionada) {
      atualizarSessao(sessaoSelecionada.id, "instrumentos", instrumentosSelecionados);
    }
    fecharModalAdicionarInstrumentos();
  };


  const removerInstrumentoDaSessao = (sessaoId, instrumento) => {
  setSessoes(prevSessoes =>
    prevSessoes.map(s => {
      if (s.id !== sessaoId) return s;
      return {
        ...s,
        instrumentos: (s.instrumentos || []).filter(i => i !== instrumento)
      }
    })
  );
};

  

  // ------- Estilos -------
  const corPresenca = (presenca) => {
    switch (presenca) {
      case "realizado": return "bg-green-200 text-black"
      case "confirmado": return "bg-blue-200 text-black"
      case "cancelado": return "bg-red-200 text-black"
      case "ausente": return "bg-yellow-200 text-black"
      default: return "bg-gray-200 text-black"
    }
  }
  const corStatus = (status_pagamento) => {
    switch (status_pagamento) {
      case "pago": return "bg-green-200 text-black"
      case "a pagar": return "bg-orange-200 text-black"
      default: return "bg-gray-200 text-black"
    }
  }

  // ------- Render -------
  return (
<div className="space-y-6 p-6 min-h-screen">
  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-indigo-400 border border-indigo-700 rounded-3xl px-8 py-5 shadow-lg">
    <h1 className="text-3xl font-bold text-white">Sessões</h1>
    <button
      onClick={abrirModal}
      className="bg-white text-indigo-600 font-semibold px-5 py-2 rounded-2xl shadow hover:bg-gray-100 transition"
    >
      + Adicionar Sessão
    </button>
  </div>
  <ResumoSessoes sessoes={sessoes}/>


  {/* Total de sessões */}
  {/* <div className="p-6 bg-white rounded-2xl shadow-md text-center">
    <h2 className="text-md font-medium text-gray-500">Total de Sessões</h2>
    <p className="text-3xl font-extrabold text-gray-900">{sessoes.length}</p>
  </div>  */}

  {/* Modal de Sessão */}
  {modalAberto && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-lg space-y-6">
        <h2 className="text-xl font-bold text-gray-800">{editandoId ? "Editar Sessão" : "Nova Sessão"}</h2>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.serie}
            onChange={e => setForm({ ...form, serie: e.target.checked })}
            disabled={!!editandoId}
            className="accent-indigo-500"
          />
          <label className="text-gray-700 font-medium">Criar sessões em série</label>
        </div>

        {form.serie && !editandoId && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-gray-700 block mb-1">Quantidade de sessões</label>
              <input
                type="number"
                value={form.quantidade}
                onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })}
                className="border rounded-xl px-3 py-2 w-full text-gray-800 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-700 block mb-1">Dias entre sessões</label>
              <input
                type="number"
                value={form.diasEntre}
                onChange={e => setForm({ ...form, diasEntre: Number(e.target.value) })}
                className="border rounded-xl px-3 py-2 w-full text-gray-800 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-gray-700 block mb-1">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={e => setForm({ ...form, data: e.target.value })}
              className="border rounded-xl px-3 py-2 w-full text-gray-800 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-700 block mb-1">Hora Início</label>
            <input
              type="time"
              value={form.hora_inicio}
              onChange={e => setForm({ ...form, hora_inicio: e.target.value })}
              className="border rounded-xl px-3 py-2 w-full text-gray-800 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-700 block mb-1">Hora Fim</label>
            <input
              type="time"
              value={form.hora_fim}
              onChange={e => setForm({ ...form, hora_fim: e.target.value })}
              className="border rounded-xl px-3 py-2 w-full text-gray-800 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-700 block mb-1">Valor (R$)</label>
          <input
            type="number"
            value={form.valor}
            onChange={e => setForm({ ...form, valor: e.target.value })}
            className="border rounded-xl px-3 py-2 w-full text-gray-800 focus:ring-2 focus:ring-indigo-200 transition"
          />
        </div>

        <button
          onClick={salvarSessao}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-2xl transition shadow-md"
        >
          {editandoId ? "Atualizar Sessão" : "Salvar Sessão"}
        </button>
      </div>
    </div>
  )}

  {/* Cards de Sessões */}
  <div className="flex flex-col gap-4">
    {sessoes.map(sessao => (
      <div
        key={sessao.id}
        className="relative rounded-2xl border border-gray-200 shadow-sm bg-white p-5 transition hover:shadow-lg hover:scale-[1.01]"
      >
        {/* Linha principal */}
        <div className="grid grid-cols-6 gap-3 items-center mb-4">
          {/* Data */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Data</span>
            <input
              type="date"
              value={sessao.data || ""}
              onChange={e => atualizarSessao(sessao.id, "data", e.target.value)}
              className="border rounded-xl px-2 py-1 text-sm text-gray-800 w-full bg-gray-50 focus:bg-blue-50 transition"
            />
          </div>
          {/* Hora Início */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Hora Início</span>
            <input
              type="time"
              value={sessao.hora_inicio || ""}
              onChange={e => atualizarSessao(sessao.id, "hora_inicio", e.target.value)}
              className="border rounded-xl px-2 py-1 text-sm text-gray-800 w-full bg-gray-50 focus:bg-blue-50 transition"
            />
          </div>
          {/* Hora Fim */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Hora Fim</span>
            <input
              type="time"
              value={sessao.hora_fim || ""}
              onChange={e => atualizarSessao(sessao.id, "hora_fim", e.target.value)}
              className="border rounded-xl px-2 py-1 text-sm text-gray-800 w-full bg-gray-50 focus:bg-blue-50 transition"
            />
          </div>
          {/* Valor */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Valor</span>
            <input
              type="number"
              value={sessao.valor || ""}
              onChange={e => atualizarSessao(sessao.id, "valor", e.target.value)}
              className="border rounded-xl px-2 py-1 text-sm text-gray-800 w-full bg-gray-50 focus:bg-blue-50 transition"
            />
          </div>
          {/* Presença */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Presença</span>
            <select
              value={sessao.presenca}
              onChange={e => atualizarSessao(sessao.id, "presenca", e.target.value)}
              className={`rounded-xl px-2 py-1 text-sm transition ${corPresenca(sessao.presenca)}`}
            >
              <option value="realizado">Realizado</option>
              <option value="confirmado">Confirmado</option>
              <option value="cancelado">Cancelado</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>
          {/* Status */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <select
              value={sessao.status_pagamento}
              onChange={e => atualizarSessao(sessao.id, "status_pagamento", e.target.value)}
              className={`rounded-xl px-2 py-1 text-sm transition ${corStatus(sessao.status_pagamento)}`}
            >
              <option value="pago">Pago</option>
              <option value="a pagar">A Pagar</option>
            </select>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => atualizarSessao(sessao.id, "detalheAberto", !sessao.detalheAberto)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm transition-all
              ${sessao.detalheAberto 
                ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" 
                : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-md"} 
              transform hover:scale-105`}
          >
            <Eye size={16} />
            {sessao.detalheAberto ? "Ocultar Detalhes" : "Ver Detalhes"}
          </button>

          <button
            onClick={() => excluirSessao(sessao.id)}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all bg-red-100 hover:bg-red-200 text-red-600 shadow-sm hover:shadow-md"
            title="Excluir Sessão"
          >
            <Trash2 size={18} />
          </button>
        </div>


{/* Detalhes */}
{sessao.detalheAberto && (
  <div className="mt-4 p-4 bg-gray-50 rounded-2xl space-y-6">

{/* Hipóteses */}
<div className="p-4 bg-white rounded-2xl shadow-md border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Hipóteses da Sessão</h3>
  <p className="text-sm text-gray-600 mb-4">
    Selecione as hipóteses relevantes para ajudar na sugestão de instrumentos.
  </p>

  {/* Pílulas de hipóteses */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
    {(sessao.hipoteses || []).map(hipId => {
      const hip = hipoteses.find(h => h.id === hipId);
      return (
        <div
          key={hipId}
          className="flex items-center justify-between bg-gradient-to-r from-green-100 to-green-200 
                     text-green-900 px-3 py-2 rounded-2xl shadow hover:scale-105 
                     transform transition cursor-pointer"
        >
          <span className="font-medium">{hip?.hipotese || "Hipótese não encontrada"}</span>
          <button
            onClick={() => removerHipoteseDaSessao(sessao.id, hipId)}
            className="text-green-700 hover:text-green-900 font-bold rounded-full 
                       transition-colors ml-2 text-2xl"
          >
            ×
          </button>
        </div>
      );
    })}
  </div>

  {/* Select para adicionar */}
  <select
    onChange={e => {
      const hipId = Number(e.target.value);
      if (hipId) {
        adicionarHipoteseNaSessao(sessao.id, hipId);
      }
      e.target.value = "";
    }}
    defaultValue=""
    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700 
               text-sm shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none transition"
  >
    <option value="" disabled>Adicionar hipótese...</option>
    {hipoteses.map(h => (
      <option key={h.id} value={h.id}>
        {h.hipotese}
      </option>
    ))}
  </select>
</div>



    {/* Instrumentos */}
    <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Instrumentos</h3>
        <button
          onClick={() => abrirModalAdicionarInstrumentos(sessao)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-2xl font-semibold text-sm transition"
        >
          <PlusCircle size={16} /> Adicionar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {(sessao.instrumentos || []).map(instId => {
        // Procurar o instrumento pelo ID
        const instrumentosArray = Array.isArray(instrumentosbd)
          ? instrumentosbd
          : Object.values(instrumentosbd).flat();

        const instObj = instrumentosArray.find(i => i.id === instId);

        return (
          <div
            key={instId}
            onClick={() => abrirModalInstrumento(sessao, instObj)}
            className="flex items-center justify-between bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded-2xl shadow transform transition hover:scale-105 cursor-pointer"
          >
            <span className="text-indigo-900 font-medium text-sm">
              {instObj?.nome || "Instrumento não encontrado"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // impede que o click no "✕" abra o modal
                removerInstrumentoDaSessao(sessao.id, instId);
              }}
              className="text-indigo-700 text-xs font-bold hover:text-indigo-900 ml-2"
            >
              ✕
            </button>
          </div>

        );
      })}

      </div>
    </div>

    {/* Campos adicionais */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="grid grid-cols-1 gap-2">
        <label className="text-gray-700 font-medium">Observações</label>
        <textarea
          value={sessao.observacoes || ""}
          onChange={e => atualizarSessao(sessao.id, "observacoes", e.target.value)}
          className="w-full border border-gray-300 rounded-2xl p-3 text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none transition=resize-y overflow-y-auto"
          placeholder="Digite observações da sessão"
          rows={3} // altura inicial
        ></textarea>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-gray-700 font-medium">Comportamento</label>
        <textarea
          value={sessao.comportamento || ""}
          onChange={e => atualizarSessao(sessao.id, "comportamento", e.target.value)}
          className="w-full border border-gray-300 rounded-2xl p-3 text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none transition
                    resize-y overflow-y-auto"
          placeholder="Digite observações da sessão"
          rows={3} // altura inicial
        ></textarea>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-gray-700 font-medium">Progresso</label>
        <textarea
          value={sessao.progresso || ""}
          onChange={e => atualizarSessao(sessao.id, "progresso", e.target.value)}
          className="w-full border border-gray-300 rounded-2xl p-3 text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none transition resize-y overflow-y-auto"
          placeholder="Digite observações da sessão"
          rows={3} // altura inicial
        ></textarea>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-gray-700 font-medium">Recomendações</label>
        <textarea
          value={sessao.recomendacoes || ""}
          onChange={e => atualizarSessao(sessao.id, "recomendacoes", e.target.value)}
          className="w-full border border-gray-300 rounded-2xl p-3 text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none transition resize-y overflow-y-auto"
          placeholder="Digite observações da sessão"
          rows={3} // altura inicial
        ></textarea>
      </div>
    </div>
  </div>
)}

</div>

  ))}
</div>

        <ModalInstrumentoDetalhe
          aberto={modalInstrumentoAberto}
          fechar={fecharModalInstrumento}
          instrumento={instrumentoAtual}
          sessaoSelecionada={sessaoSelecionada}
          paciente={paciente}
          />
       <ModalInstrumentos
          aberto={modalAdicionarInstrumentosAberto}
          fechar={fecharModalAdicionarInstrumentos}
          instrumentosDisponiveis={instrumentosDisponiveis}
          setInstrumentosDisponiveis={setInstrumentosDisponiveis}
          sessaoSelecionada={sessaoSelecionada}
          construtosFiltro={construtosFiltro}      
          setConstrutosFiltro={setConstrutosFiltro} 
          idadeFiltro={idadeFiltro}
          setIdadeFiltro={setIdadeFiltro}
          areasFiltro={areasFiltro}                 
          setAreasFiltro={setAreasFiltro}           
          areasProfissionaisFiltro={areasProfissionaisFiltro}
          setAreasProfissionaisFiltro={setAreasProfissionaisFiltro}
          instrumentosSelecionados={instrumentosSelecionados}
          toggleInstrumento={toggleInstrumento}
          adicionarInstrumentosSelecionados={adicionarInstrumentosSelecionados}
          hipotesesDisponiveis={hipoteses}
          verificarIdade={verificarIdade}
          idadeSessao={idadeSessao}
        />
    </div>
  )
}


