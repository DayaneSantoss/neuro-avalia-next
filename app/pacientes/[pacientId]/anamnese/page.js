import PacientNavigation from "@/app/_components/PacientNavigation";
import { getPacientById, getProfile } from "@/app/_lib/data-service";
import { auth } from "@/app/_lib/auth";
import Spinner from "@/app/_components/Spinner";
import { Suspense } from "react";


export async function generateMetadata({params}) {
  const { nome } = await getPacientById(params.pacientId)
  return { title: nome}
}


import { buscarPerguntas } from '@/app/_lib/actions'
import Formulario from '@/app/_components/FormPage2'

export default async function Page({params}) {

  const pacient = await getPacientById(params.pacientId);

  const session = await auth();
  const perfil = await getProfile(session.user.email);

  const idFormulario = 1
  const idPaciente = params.pacientId

  const perguntas = await buscarPerguntas(idFormulario, idPaciente)

  return (
    <div className="grid grid-cols-[20rem_1fr]">
       <PacientNavigation pacient={pacient} />
        <Suspense fallback={
          <div className="flex-grow">
            <Spinner />
          </div>
        }>
          <Formulario
            perguntas={perguntas}
            idPaciente={idPaciente}
            idFormulario={idFormulario}
            pacient={pacient}
            perfil={perfil}
          />
        </Suspense>
     </div>
  )
}
