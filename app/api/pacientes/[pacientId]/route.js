import { getPacientById } from "@/app/_lib/data-service";


export async function GET( request, {params}) {
  
  const { pacientId } =  params;

  try {
    const [pacient] = await Promise.all([getPacientById(pacientId)])
    return Response.json({pacient})
  } catch {
    return Response.json({message: "Paciente não encontrado"})
  }

}

// export async function POST() {}