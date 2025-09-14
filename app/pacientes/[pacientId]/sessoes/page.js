import PacientNavigation from "@/app/_components/PacientNavigation";
import { getPacientById} from "@/app/_lib/data-service";
import { getSessoes, getHipoteses, getInstrumentos } from "@/app/_lib/actions";
import SessoesPaciente from "@/app/_components/SessionsView";

export async function generateMetadata({ params }) {
  const { nome } = await getPacientById(params.pacientId)
  return { title: nome }
}

export default async function Page({ params }) {

  const calcularIdade = (dataNascimento) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesNascimento = nascimento.getMonth();
    const mesAtual = hoje.getMonth();
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  
  const paciente = await getPacientById(params.pacientId);
  const idPaciente = params.pacientId
  const hipoteses = await getHipoteses(idPaciente)
  const instrumentos = await getInstrumentos()
  const idade = paciente.dataNascimento ? calcularIdade(paciente.dataNascimento) : null;
  const sessoes = await getSessoes(idPaciente)
  
  // console.log(paciente)

  // console.log(instrumentos)
  return (
    <div className="grid grid-cols-[20rem_1fr] min-h-screen">
      <PacientNavigation pacient={paciente} />
      <div>
        <SessoesPaciente hipoteses={hipoteses} instrumentosbd={instrumentos} idadePaciente={idade} paciente={paciente} sessoes={sessoes}/>
      </div>
    </div>
  )
}
