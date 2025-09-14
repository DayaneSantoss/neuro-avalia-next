import PacientNavigation from "@/app/_components/PacientNavigation";
import GerenciadorArquivos from "@/app/_components/GerenciadorArquivos";
import { getPacientById} from "@/app/_lib/data-service";
import {getArquivosPaciente} from "@/app/_lib/actions"


export async function generateMetadata({ params }) {
  const { nome } = await getPacientById(params.pacientId)
  return { title: nome }
}

export default async function Page({ params }) {

  const pacient = await getPacientById(params.pacientId);
  const idPaciente = params.pacientId
  const arquivos = await getArquivosPaciente(idPaciente)
  console.log(idPaciente)

  return (
    <div className="grid grid-cols-[20rem_1fr] min-h-screen">
      <PacientNavigation pacient={pacient} />
      <div>
       <GerenciadorArquivos pacienteId={idPaciente} arquivosIniciais={arquivos}/>
      </div>
    </div>
  )
}
