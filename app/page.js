"use client"

import { Users, ClipboardCheck, FileText, Brain, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PaginaInicial() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col items-center p-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mt-12">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">Bem-vindo(a) ao <span className="text-indigo-900">NeuroApp</span></h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          Um aplicativo pensado para apoiar <span className="font-semibold">psicólogos, pedagogos e neuropsicopedagogos</span> 
          na organização do acompanhamento de pacientes, com recursos que tornam seu trabalho 
          mais <span className="text-indigo-600 font-semibold">ágil, prático e eficiente</span>.
        </p>

        <button
          onClick={() => router.push("/pacientes")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition mx-auto"
        >
          <Users className="w-5 h-5" />
          Meus Pacientes
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <ClipboardCheck className="text-indigo-500 w-10 h-10 mb-4" />
          <h3 className="font-semibold text-lg text-gray-800">Gerenciamento de Sessões</h3>
          <p className="text-gray-600 mt-2">Controle sessões realizadas, ausentes, canceladas e confirme presenças com facilidade.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <FileText className="text-green-500 w-10 h-10 mb-4" />
          <h3 className="font-semibold text-lg text-gray-800">Documentos & Contratos</h3>
          <p className="text-gray-600 mt-2">Organize arquivos, contratos e registros importantes em um só lugar.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <Brain className="text-purple-500 w-10 h-10 mb-4" />
          <h3 className="font-semibold text-lg text-gray-800">Aplicação de Testes</h3>
          <p className="text-gray-600 mt-2">Disponibilize e aplique testes públicos como o <span className="font-semibold">M-CHAT</span> e registre resultados.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 text-gray-500 text-sm text-center">
        Desenvolvido para apoiar sua prática profissional com <span className="text-indigo-600 font-semibold">organização</span> e <span className="text-indigo-600 font-semibold">eficiência</span>.
      </div>
    </div>
  )
}
