import Image from 'next/image';
import { EyeSlashIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/solid';

function PacientView({ pacient }) {
  return (
    <div className="grid grid-cols-[20rem_1fr] h-full flex-1">
      <div className='flex flex-col border border-primary-800 py-3 px-10 mb-24'>
      {/* Lado da imagem */}
      <div className='flex-shrink-0 mr-5'>
        <div className='relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary-500'>
          <Image
            src={pacient.image}
            fill
            className='object-cover'
            alt={`Paciente ${pacient.name}`}
          />
        </div>
      </div>

      {/* Lado das informações do paciente */}
      <div className='flex flex-col item-center'>
        <h3 className='text-accent-50 font-black text-xl mb-2'>
          Paciente: {pacient.name}
        </h3>

        <p className='text-lg text-primary-300 mb-5'>
          {pacient.description || "Sem descrição disponível"}
        </p>

        <ul className='flex flex-col gap-4 mb-7'>
          <li className='flex gap-3 items-center'>
            <UsersIcon className='h-5 w-5 text-primary-600' />
            <span className='text-lg'>{pacient.age} anos</span>
          </li>
          <li className='flex gap-3 items-center'>
            <MapPinIcon className='h-5 w-5 text-primary-600' />
            <span className='text-lg'>{pacient.location || "Localização desconhecida"}</span>
          </li>
          <li className='flex gap-3 items-center'>
            <EyeSlashIcon className='h-5 w-5 text-primary-600' />
            <span className='text-lg'>
              Privacidade <span className='font-bold'>100%</span> garantida
            </span>
          </li>
          <li className='flex gap-3 items-center'>
            <span className='text-lg'>{pacient.email || "Email não disponível"}</span>
          </li>
          <li className='flex gap-3 items-center'>
            <span className='text-lg'>{pacient.telephone || "Telefone não disponível"}</span>
          </li>
        </ul>
      </div>
    </div>
    </div>
  );
}

export default PacientView;