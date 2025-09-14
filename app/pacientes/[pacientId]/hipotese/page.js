import PacientNavigation from "@/app/_components/PacientNavigation";
import { getPacientById, getProfile } from "@/app/_lib/data-service";
import { auth } from "@/app/_lib/auth";
import HipoteseIA from '@/app/_components/HipoteseIA'
import { buscarPerguntasComRespostas, getResumoAnamnese, getHipoteses } from "@/app/_lib/actions";

export async function generateMetadata({params}) {
  const { nome } = await getPacientById(params.pacientId)
  return { title: nome}
}

export default async function Page({params}) {

  const pacient = await getPacientById(params.pacientId);

  const session = await auth();
  const perfil = await getProfile(session.user.email);

  const idFormulario = 1
  const idPaciente = params.pacientId

  const perguntas = await buscarPerguntasComRespostas(idFormulario, idPaciente)
  const resumoAnamnese = await getResumoAnamnese(idPaciente)
  const hipoteses = await getHipoteses(idPaciente)
  

  return (
    <div className="grid grid-cols-[20rem_1fr]">
       <PacientNavigation pacient={pacient} />
       <div className="flex-grow">
      <HipoteseIA
        pacient={pacient}
        perfil={perfil}
        perguntas={perguntas}
        resumoInicial={resumoAnamnese ?? ""}
        hipotesesInicial = {hipoteses ?? []}
      />
    </div>
     </div>
  )
}
