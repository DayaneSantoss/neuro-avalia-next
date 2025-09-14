// // pages/pacientes/[pacientId]/resumo/page.js
import PacientEdit from "@/app/_components/PacientEdit"; // Ajuste o caminho se necessário
import { getPacientById } from "@/app/_lib/data-service";


export async function Editar({ params }) {
  const pacient = await getPacientById(params.pacientId)
  
  return (
      <PacientEdit pacient={pacient} />
  );
}
export default Editar;