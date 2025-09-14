"use client"

import { Info } from "lucide-react"

export default function ResumoGeral({ paciente }) {

  return (

      <>
      {/* Informações do paciente */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4 flex items-center gap-2">
          <Info size={20} /> Informações do Paciente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="font-bold text-gray-700">Nome:</span> <span className="text-gray-700">{paciente.nomePaciente}</span></div>
          <div><span className="font-bold text-gray-700">Data de Nascimento:</span> <span className="text-gray-700">{paciente.dataNascimento}</span></div>
          <div><span className="font-bold text-gray-700">Sexo:</span> <span className="text-gray-700">{paciente.sexo}</span></div>
          <div><span className="font-bold text-gray-700">E-mail:</span> <span className="text-gray-700">{paciente.email || "Não informado"}</span></div>
          <div><span className="font-bold text-gray-700">Telefone:</span> <span className="text-gray-700">{paciente.telefone || "Não informado"}</span></div>
          <div><span className="font-bold text-gray-700">Endereço:</span> <span className="text-gray-700">{paciente.endereco || "Não informado"}</span></div>
          {paciente.queixa && <div className="col-span-2"><span className="font-bold text-gray-700">Queixa principal:</span><span> {paciente.queixa}</span></div>}
          {paciente.escola && <div className="col-span-2"><span className="font-bold text-gray-700">Escola:</span><span className="text-gray-700"> {paciente.escola}</span></div>}
          {paciente.serie && <div className="col-span-2"><span className="font-bold text-gray-700">Serie:</span><span className="text-gray-700"> {paciente.serie}</span></div>}
          {paciente.nomeResponsavel && <div className="col-span-2"><span className="font-bold text-gray-700">Nome do Responsável:</span><span className="text-gray-700"> {paciente.nomeResponsavel}</span></div>}
          {paciente.cpf && <div className="col-span-2"><span className="font-bold text-gray-700">CPF:</span><span className="text-gray-700"> {paciente.cpf}</span></div>}
          {paciente.tipoIntervencao && <div className="col-span-2"><span className="font-bold text-gray-700">Tipo de Intervencao:</span><span className="text-gray-700"> {paciente.tipoIntervencao}</span></div>}
          {paciente.descricaoLaudo && <div className="col-span-2"><span className="font-bold text-gray-700">Descrição do Laudo</span><span className="text-gray-700"> {paciente.descricaoLaudo}</span></div>}
        </div>
      </div>

    
      </>
    // </div>
  )
}
