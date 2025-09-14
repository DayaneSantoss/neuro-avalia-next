import PacientNavigation from "@/app/_components/PacientNavigation"; // Ajuste o caminho se necessário
import { getPacientById } from "@/app/_lib/data-service";
import { getHipoteses, getSessoes} from "@/app/_lib/actions";
import ResumoGeral from "@/app/_components/ResumoGeral";
import ResumoSessoes from "@/app/_components/ResumoSessoes";
import { Suspense } from "react";
import Spinner from "@/app/_components/Spinner";
import ViewHipoteses from "@/app/_components/HipotesesView";



export async function Resumo({ params }) {
  const pacient = await getPacientById(params.pacientId)
  const idPaciente = params.pacientId
  const hipoteses = await getHipoteses(idPaciente)
  const sessoes = await getSessoes(idPaciente)
  console.log(sessoes)
  
  return (
    <div className="grid grid-cols-[20rem_1fr]">
      <PacientNavigation pacient={pacient} />
      <div className="bg-gray-100 min-h-screen py-10 px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-indigo-400 border border-indigo-200 rounded-3xl px-8 py-5 mb-10 shadow-md border border-indigo-700">
        <h1 className="text-2xl font-bold text-white rounded-lg ">
          Resumo Geral do Paciente
        </h1>
        </div>
        <Suspense fallback={
          <div className="flex-grow">
            <Spinner />
          </div>
        }>
          <ResumoGeral paciente={pacient}/>
          <ResumoSessoes sessoes={sessoes}/>
          <ViewHipoteses hipoteses={hipoteses}/>
        </Suspense>
      </div>
    </div>
  );
}
export default Resumo;