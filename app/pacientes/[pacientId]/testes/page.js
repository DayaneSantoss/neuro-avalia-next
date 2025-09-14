import PacientNavigation from "@/app/_components/PacientNavigation";
import TestesPublicos from "@/app/_components/TesteAplicacao";
import ViewHipoteses from "@/app/_components/HipotesesView";
import { getPacientById, getProfile } from "@/app/_lib/data-service";
import { auth } from "@/app/_lib/auth";
import { buscarPerguntasComRespostas, getResumoAnamnese, getHipoteses, getInstrumentos } from "@/app/_lib/actions";
import SessoesPaciente from "@/app/_components/SessionsView";

export async function generateMetadata({ params }) {
  const { nome } = await getPacientById(params.pacientId)
  return { title: nome }
}

export default async function Page({ params }) {

  const pacient = await getPacientById(params.pacientId);


  return (
    <div className="grid grid-cols-[20rem_1fr] min-h-screen">
      <PacientNavigation pacient={pacient} />
      <div>
       <TestesPublicos/>
      </div>
    </div>
  )
}
