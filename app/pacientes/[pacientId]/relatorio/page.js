import PacientNavigation from "@/app/_components/PacientNavigation";
import RelatorioAvaliacao from "@/app/_components/RelatorioAvaliacao";
import { getPacientById, getProfile } from "@/app/_lib/data-service";
import { auth } from "@/app/_lib/auth";

export async function generateMetadata({ params }) {
  const { nome } = await getPacientById(params.pacientId)
  return { title: nome }
}

export default async function Page({ params }) {

  const paciente = await getPacientById(params.pacientId);

  const session = await auth();
  const perfil = await getProfile(session.user.email);
  const idPaciente = params.pacientId

  return (
    <div className="grid grid-cols-[20rem_1fr] min-h-screen">
      <PacientNavigation pacient={paciente} />
      <div>
        <RelatorioAvaliacao idPaciente={idPaciente} pacient={paciente} perfil={perfil}/>
      </div>
    </div>
  )
}
