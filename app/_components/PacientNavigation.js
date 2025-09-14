import Link from "next/link";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  FolderIcon,
  ArrowRightCircleIcon
} from '@heroicons/react/24/solid';
import Image from "next/image";

const navLinks = [
  { name: 'Resumo Geral', href: '/', icon: <HomeIcon className='h-5 w-5 text-indigo-600' /> },
  { name: 'Anamnese', href: 'anamnese', icon: <ClipboardDocumentListIcon className='h-5 w-5 text-indigo-600' /> },
  { name: 'Hipotese diagnóstica', href: 'hipotese', icon: <MagnifyingGlassIcon className='h-5 w-5 text-indigo-600' /> },
  { name: 'Sessões', href: 'sessoes', icon: <CalendarDaysIcon className='h-5 w-5 text-indigo-600' /> },
  { name: 'Relatório de Avaliação', href: 'relatorio', icon: <DocumentTextIcon className='h-5 w-5 text-indigo-600' /> },
  { name: 'Contratos', href: 'contratos', icon: <DocumentCheckIcon className='h-5 w-5 text-indigo-600' /> },
  { name: 'Arquivos', href: 'arquivos', icon: <FolderIcon className='h-5 w-5 text-indigo-600' /> },
  { name: 'Testes Públicos', href: 'testes', icon: <ArrowRightCircleIcon className='h-5 w-5 text-indigo-600' /> },
];

function PacientNavigation({ pacient }) {
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

  const idade = pacient.dataNascimento ? calcularIdade(pacient.dataNascimento) : null;

  return (
    <nav className="grid grid-cols-[18rem_1fr] h-full flex-1">
      <div
        className="flex flex-col border border-gray-200 py-6 px-6 bg-primary-10 rounded-2xl min-h-screen"
        // style={{ maxHeight: '100vh' }}
      >
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 bg-white shadow-sm">
            <Image
              src={pacient.imagem || "/placeholder-user.png"} // imagem padrão se `imagem` for undefined/null
              alt={`Foto de ${pacient.nomePaciente}`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center mb-8">
          <h3 className="text-indigo-600 font-semibold text-lg">{pacient.nomePaciente}</h3>
          {idade !== null && (
            <li className="flex gap-2 items-center py-2">
              <span className="text-sm text-gray-700">{idade} anos</span>
            </li>)}

          <div className={`inline-block text-sm font-semibold px-2 py-1 rounded-md max-w-[120px] truncate border
              ${pacient.status === 'Avaliação' ? 'bg-orange-100 text-orange-600 border-orange-400' :
                pacient.status === 'Intervenção' ? 'bg-green-100 text-green-600 border-green-400' :
                'bg-gray-100 text-gray-600 border-gray-400'}
            `}>
              {pacient.status}
            </div>
        </div>

        <div className="flex flex-col flex-grow overflow-y-auto">
          <ul className="flex flex-col gap-3 text-x text-gray-900">
           

            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={`/pacientes/${pacient.id}/${link.href}`}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default PacientNavigation;
