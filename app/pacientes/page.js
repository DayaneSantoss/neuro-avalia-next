import { Suspense } from "react";
import Link from "next/link";
import PacientList from "../_components/PacientList";
import Spinner from "../_components/Spinner";
import { auth } from "../_lib/auth";
import { getPacients } from "../_lib/data-service";

export default async function Page() {
  const session = await auth();
  const pacients = session?.user ? await getPacients(session.user.userId) : [];

  return (
    <div className="px-10 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-indigo-400 border border-indigo-800 rounded-3xl px-8 py-6 mb-10 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
            Meus Pacientes
          </h1>
          <Link href="/pacientes/cadastro">
            <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-5 rounded-md text-sm font-semibold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transform hover:scale-[1.05]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar
            </button>
          </Link>
        </div>
      </div>

      {/* Lista de pacientes com pesquisa */}
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      }>
        <PacientList pacients={pacients} />
      </Suspense>
    </div>
  );
}
