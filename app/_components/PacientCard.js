'use client'
import Link from "next/link";
import PacientActions from "./PacientActions";
import Image from "next/image";

export default function PacientCard({ pacient }) {
  const { id, nomePaciente, dataNascimento, email, telefone, imagem, userId, status } = pacient;

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

  const idade = calcularIdade(dataNascimento);

  return (
    <div className="relative rounded-xl border shadow-sm bg-primary-10 transition-all duration-200 ease-in-out transform hover:scale-[1.03] hover:shadow-xl">

      <Link href={`/pacientes/${id}`} className="block">
        <div className="grid grid-cols-[2fr_1fr_1fr_2fr_1fr] gap-6 items-start px-6 py-4 cursor-pointer select-none pr-36">

          {/* Imagem + Nome separadamente */}
          <div className="flex gap-3 items-start">
            {/* Imagem */}
            <div className="w-14 h-14 relative rounded-full overflow-hidden border-2 border-indigo-100 shrink-0 mt-5">
              <Image
              src={imagem || "/placeholder-user.png"} // imagem padrão se `imagem` for undefined/null
              alt={`Foto de ${nomePaciente}`}
              fill
              className="object-cover"
            />
            </div>

            {/* Nome com título */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-primary-900">Nome</span>
              <span className="text-primary-950 text-sm">{nomePaciente}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-primary-900">Status</span>
            <div className={`inline-block text-xs font-semibold px-2 py-1 rounded-md max-w-[120px] truncate border
              ${status === 'Avaliação' ? 'bg-orange-100 text-orange-600 border-orange-400' :
                status === 'Intervenção' ? 'bg-green-100 text-green-600 border-green-400' :
                'bg-gray-100 text-gray-600 border-gray-400'}
            `}>
              {status || "Sem descrição"}
            </div>
          </div>


          {/* Idade */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-primary-900">Idade</span>
            <div className="text-primary-950 text-sm">{idade} anos</div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-primary-900">E-mail</span>
            <div className="text-primary-950 text-sm break-words">{email}</div>
          </div>

          {/* Telefone */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-primary-900">Telefone</span>
            <div className="text-primary-950 text-sm">{telefone}</div>
          </div>
        </div>
      </Link>

      {/* Ações */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <PacientActions pacientId={id} pacientName={nomePaciente} />
      </div>
    </div>
  );
}
