'use client';

import { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FormPdf from '@/app/_components/FormPdf';
// import { registerAnamnese } from '@/app/_lib/actions';

const secoes = [
  {
    titulo: "I - Queixa Principal",
    perguntas: [
      { id: 1, pergunta: 'Descreva o motivo pelo qual a avaliação foi solicitada: dificuldades percebidas, comportamentos observados ou solicitações da escola/profissional', tipo: 'texto' },
    ]
  },
  { 
    titulo: "II - Identificação",
    perguntas: [
      { id: 2, pergunta: 'Em caso de adoção, descreva se ocorreu estágio de convivência ou outros fatos importantes neste processo', tipo: 'texto' },
      { id: 3, pergunta: 'Há casos de adoção na família?', tipo: 'simNao'},
      { id: 4, pergunta: 'A criança faz uso de medicamento(s)?', tipo: 'simNao', extraOn: 'Sim', extraPlaceholder: 'Quais medicamentos?' },
      { id: 5, pergunta: 'A criança tem um apelido?', tipo: 'simNao', extraOn: 'Sim', extraPlaceholder: 'História do apelido'},
      { id: 6, pergunta: 'A família possui religião?', tipo: 'simNao' },
      { id: 7, pergunta: 'Há caso de dependência química (uso de álcool e (ou) outras drogas lícitas ou ilícitas) na família?', tipo: 'simNao', extraOn: 'Sim', extraPlaceholder: 'Quais?' },
      { id: 8, pergunta: 'A criança possui problemas de visão?', tipo: 'simNao', extraOn: 'Sim', extraPlaceholder: 'Quais?' },
      { id: 9, pergunta: 'Faz uso de lentes corretivas?', tipo: 'simNao', extraOn: 'Sim', extraPlaceholder: 'Quais?' },
      { id: 10, pergunta: 'A criança possui algum problema auditivo?', tipo: 'simNao', extraOn: 'Sim', extraPlaceholder: 'Quais?' },
      { id: 11, pergunta: 'Faz uso de algum aparelho?', tipo: 'simNao', extraOn: 'Sim', extraPlaceholder: 'Quais?'},

      ]
  },
  {
    titulo: "III - História Familiar",
    perguntas: [
      { id: 12, pergunta: 'História de saúde da familia materna', tipo: 'texto' },
      { id: 13, pergunta: 'História de saúde da familia paterna', tipo: 'texto' },
      { id: 14, pergunta: 'Houve uso de medicamentos ou drogas de abuso antes ou durante o período gestacional?', tipo: 'texto' },
      { id: 15, pergunta: 'A mãe teve alguma doença que necessitou de tratamento durante a gestação. Quais medicamentos, dose e por quanto tempo (se nos primeiros meses ou últimos meses)', tipo: 'texto' },
      { id: 16, pergunta: 'História da vida escolar da familia materna', tipo: 'texto' },
      { id: 17, pergunta: 'História da vida escolar da familia paterna', tipo: 'texto' },
      { id: 18, pergunta: 'Descrição do desempenho escolar dos irmãos (caso tenha)', tipo: 'texto' },
      { id: 19, pergunta: 'A criança/adolescente já realizou algum tipo de exame e/ou avaliação neurológica? Qual?', tipo: 'texto' },
      { id: 20, pergunta: 'A criança/adolescente já realizou avaliações com especialista? Quais?', tipo: 'texto' },
    ]
  },
];

export default function FormPage({pacient, pacientId}) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [simNaoRespostas, setSimNaoRespostas] = useState({});

  useEffect(() => {
    const allIds = secoes.flatMap(secao => secao.perguntas.map(p => p.id));
    setSelectedQuestions(allIds);
  }, []);

  function toggleQuestion(id) {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  }

  function handleAnswerChange(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleSimNaoChange(id, value) {
    setSimNaoRespostas((prev) => ({ ...prev, [id]: value }));
    const q = secoes.flatMap(s => s.perguntas).find((q) => q.id === id);
    if (!q?.extraOn || value !== q.extraOn) {
      setAnswers((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  }

  const perguntasSelecionadas = selectedQuestions.map((id) => {
    const q = secoes.flatMap(s => s.perguntas).find((q) => q.id === id);
    return {
      id,
      pergunta: q?.pergunta || '',
      resposta:
        q?.tipo === 'simNao'
          ? (simNaoRespostas[id] ?? '')+
            (q?.extraOn && simNaoRespostas[id] === q.extraOn && answers[id]
              ? ` - ${answers[id]}`
              : '')
          : answers[id] ?? '',
    };
  });

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 pb-40">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-white mb-8 px-6 py-4 bg-indigo-400 rounded-lg border border-indigo-700">
          Formulário de Anamnese
        </h2>

        <form action={registerAnamnese} className="space-y-6">

          <input type="hidden" name="pacientId" value={pacientId} />
          {secoes.map((secao, index) => (
            <div key={index} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">{secao.titulo}</h3>
              {secao.perguntas.map((q) => (
                <div key={q.id} className="relative border p-4 rounded space-y-3">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(q.id)}
                    onChange={() => toggleQuestion(q.id)}
                    className="absolute top-3 right-3 w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />

                  <span className="text-gray-800">{q.pergunta}</span>

                  {selectedQuestions.includes(q.id) && (
                    <>
                      {q.tipo === 'simNao' ? (
                        <>
                          <div className="flex gap-6">
                            <label className="inline-flex items-center text-black">
                              <input
                                type="radio"
                                name={`resposta-${q.id}`}
                                value="Sim"
                                checked={simNaoRespostas[q.id] === 'Sim'}
                                onChange={(e) => handleSimNaoChange(q.id, e.target.value)}
                                className="form-radio text-indigo-700"
                                // required
                              />
                              <span className="ml-2">Sim</span>
                            </label>

                            <label className="inline-flex items-center text-black">
                              <input
                                type="radio"
                                name={`resposta-${q.id}`}
                                value="Não"
                                checked={simNaoRespostas[q.id] === 'Não'}
                                onChange={(e) => handleSimNaoChange(q.id, e.target.value)}
                                className="form-radio text-indigo-600"
                              />
                              <span className="ml-2">Não</span>
                            </label>
                          </div>

                          {q.extraOn &&
                            simNaoRespostas[q.id] === q.extraOn && (
                              <div className="mt-4 ">
                              <span className="text-gray-800">{q.extraPlaceholder || 'Descreva a resposta'}</span>
                              <textarea
                                name={`extra-${q.id}`}
                                className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-2"
                                value={answers[q.id] || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              />
                            </div>
                            )}
                        </>
                      ) : (
                        <textarea
                          name={`resposta-${q.id}`}
                          className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Relate"
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}

          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-4 flex justify-end gap-4 z-50">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Salvar
            </button>

            {perguntasSelecionadas.length > 0 && (
              <PDFDownloadLink
              document={
                <FormPdf
                  perguntas={secoes.map((secao) => ({
                    titulo: secao.titulo,
                    perguntas: secao.perguntas
                      .filter((p) => selectedQuestions.includes(p.id))
                      .map((p) => {
                        const resposta =
                          p.tipo === 'simNao'
                            ? (simNaoRespostas[p.id] ?? '') +
                              (p.extraOn && simNaoRespostas[p.id] === p.extraOn && answers[p.id]
                                ? ` - ${answers[p.id]}`
                                : '')
                            : answers[p.id] ?? '';
                        return {
                          ...p,
                          resposta,
                        };
                      }),
                  }))}
                />
              }
              fileName="formulario.pdf"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-md transition"
            >
              {({ loading }) => (loading ? 'Gerando PDF...' : 'Baixar PDF')}
            </PDFDownloadLink>

            )}
          </div>
        </form>
      </div>
    </div>
  );
}
