"use client"

import { useState } from "react"

export default function TestesPublicosAvancado() {
  const testesDisponiveis = [
    {
      id: 1,
      nome: "M-CHAT",
      instrucoes: `Checklist de triagem para risco de autismo em crianças.
Responda "Sim" ou "Não" conforme observado.
Pontuação: Cada "Sim" = 1 ponto. Pontuação alta indica maior risco.`,
      perguntas: [
        { pergunta: "A criança mostra interesse em brincar com outras crianças?", tipo: "simnao" },
        { pergunta: "A criança aponta para coisas para mostrar interesse?", tipo: "simnao" },
        { pergunta: "A criança usa gestos para se comunicar?", tipo: "simnao" },
      ],
    },
    {
      id: 2,
      nome: "QAI - Questionário de Ansiedade Infantil",
      instrucoes: `Avalia sintomas de ansiedade em crianças.
Responda a frequência de cada comportamento:
0 = Nunca, 1 = Às vezes, 2 = Frequentemente, 3 = Sempre.`,
      perguntas: [
        { pergunta: "A criança fica nervosa em novas situações?", tipo: "escala" },
        { pergunta: "A criança se preocupa excessivamente com acontecimentos futuros?", tipo: "escala" },
        { pergunta: "A criança tem dificuldade em dormir por ansiedade?", tipo: "escala" },
      ],
    },
    {
      id: 3,
      nome: "Observação Geral",
      instrucoes: `Espaço para registrar observações do profissional.`,
      perguntas: [
        { pergunta: "Escreva suas observações:", tipo: "texto" },
      ],
    },
  ]

  const [testeSelecionado, setTesteSelecionado] = useState(null)
  const [respostas, setRespostas] = useState({})
  const [resultadoFinal, setResultadoFinal] = useState(null)

  const iniciarTeste = (teste) => {
    setTesteSelecionado(teste)
    setRespostas({})
    setResultadoFinal(null)
  }

  const registrarResposta = (pergunta, valor) => {
    setRespostas(prev => ({ ...prev, [pergunta]: valor }))
  }

  const finalizarTeste = () => {
    let total = 0
    testeSelecionado.perguntas.forEach(q => {
      const val = respostas[q.pergunta]
      if (q.tipo === "simnao" || q.tipo === "escala") total += Number(val) || 0
    })
    setResultadoFinal(`Pontuação total: ${total}`)
  }

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto py-6">
      {!testeSelecionado ? (
        <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-indigo-400 border border-indigo-200 rounded-3xl px-8 py-5 mb-10 shadow-md border border-indigo-700">
        <h1 className="text-2xl font-bold text-white rounded-lg ">
          Testes Públicos
        </h1>
        </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {testesDisponiveis.map(t => (
              <div key={t.id} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer" onClick={() => iniciarTeste(t)}>
                <h2 className="text-xl font-semibold text-indigo-600 mb-3">{t.nome}</h2>
                <p className="text-gray-600 text-sm whitespace-pre-line">{t.instrucoes.split('\n').slice(0, 2).join('\n')}...</p>
                <button className="mt-4 px-4 py-2 bg-indigo-200 hover:bg-indigo-300 text-indigo-800 rounded-2xl transition w-full">Iniciar</button>
              </div>
            ))}
          </div>
        </div>
      ) : !resultadoFinal ? (
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-3xl">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">{testeSelecionado.nome}</h2>
          <p className="text-gray-700 mb-6 whitespace-pre-line">{testeSelecionado.instrucoes}</p>

          <div className="flex flex-col gap-6">
            {testeSelecionado.perguntas.map((q, i) => (
              <div key={i} className="flex flex-col">
                <p className="text-gray-800 mb-2 font-medium">{i + 1}. {q.pergunta}</p>
                {q.tipo === "simnao" && (
                  <div className="flex gap-3">
                    {["Sim", "Não"].map((v, idx) => (
                      <button
                        key={v}
                        onClick={() => registrarResposta(q.pergunta, idx)}
                        className={`px-4 py-2 rounded-2xl border font-medium ${respostas[q.pergunta] === idx ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-indigo-200'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
                {q.tipo === "escala" && (
                  <div className="flex gap-3">
                    {[0, 1, 2, 3].map(val => (
                      <button
                        key={val}
                        onClick={() => registrarResposta(q.pergunta, val)}
                        className={`px-4 py-2 rounded-2xl border font-medium ${respostas[q.pergunta] === val ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-indigo-200'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
                {q.tipo === "texto" && (
                  <textarea
                    value={respostas[q.pergunta] || ""}
                    onChange={(e) => registrarResposta(q.pergunta, e.target.value)}
                    className="border rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4 justify-end">
            <button onClick={() => setTesteSelecionado(null)} className="px-5 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 transition">Voltar</button>
            <button onClick={finalizarTeste} className="px-5 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition">Finalizar Teste</button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">{testeSelecionado.nome} - Resultado</h2>
          <p className="text-gray-700 mb-6">{resultadoFinal}</p>
          {testeSelecionado.perguntas.filter(q => q.tipo === "texto").map(q => (
            <div key={q.pergunta} className="text-left mb-4">
              <p className="font-semibold text-gray-800">{q.pergunta}</p>
              <p className="text-gray-600">{respostas[q.pergunta]}</p>
            </div>
          ))}
          <button onClick={() => setTesteSelecionado(null)} className="px-5 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition">Voltar</button>
        </div>
      )}
    </div>
  )
}
