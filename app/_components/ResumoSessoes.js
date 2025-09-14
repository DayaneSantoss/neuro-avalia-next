"use client"

import { FileText} from "lucide-react"

export default function ResumoSessoes({ sessoes }) {
  // Calcular contagens
  console.log(sessoes)
  const totalSessoes = sessoes.length

//   const concluidas = sessoes.filter(s => s.status === "Concluída").length
  const canceladas = sessoes.filter(s => s.presenca === "cancelado").length
  const realizadas = sessoes.filter(s => s.presenca === "realizado").length
  const confirmadas = sessoes.filter(s => s.presenca === "confirmado").length
  const ausentes = sessoes.filter(s => s.presenca === "ausente").length
  const pagas = sessoes.filter(s => s.status_pagamento === "pago").length
  const naoPagas = totalSessoes - pagas

  return (

      <>
      {/* Estatísticas das sessões */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4 flex items-center gap-2">
          <FileText size={20} /> Estatísticas das Sessões
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-indigo-100 text-indigo-700 p-4 rounded-2xl text-center">
            <span className="font-bold text-lg">{totalSessoes}</span>
            <p>Total de sessões</p>
          </div>
          {/* <div className="bg-green-100 text-green-700 p-4 rounded-2xl text-center">
            <span className="font-bold text-lg">{concluidas}</span>
            <p>Concluídas</p>
          </div> */}
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-2xl text-center">
            <span className="font-bold text-lg">{confirmadas}</span>
            <p>Confirmadas</p>
          </div>
          <div className="bg-red-100 text-red-700 p-4 rounded-2xl text-center">
            <span className="font-bold text-lg">{canceladas}</span>
            <p>Canceladas</p>
          </div>
          <div className="bg-green-100 text-green-700 p-4 rounded-2xl text-center">
            <span className="font-bold text-lg">{realizadas}</span>
            <p>Realizadas</p>
          </div>
          <div className="bg-gray-100 text-gray-700 p-4 rounded-2xl text-center">
            <span className="font-bold text-lg">{ausentes}</span>
            <p>Ausentes</p>
          </div>
          <div className="bg-indigo-200 text-indigo-900 p-4 rounded-2xl text-center">
            <span className="font-bold text-lg">{pagas}</span>
            <p>Pagas</p>
          </div>
          <div className="bg-pink-100 text-pink-700 p-4 rounded-2xl text-center">
            <span className="font-bold text-lg">{naoPagas}</span>
            <p>Não pagas</p>
          </div>
        </div>
      </div>
      
     
      </>
    // </div>
  )
}
