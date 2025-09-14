// app/account/page.tsx
import { auth } from "@/app/_lib/auth";
import { getProfile} from "../_lib/data-service";
import { updateProfile } from "../_lib/actions";
import SignOutButton from '@/app/_components/SignOutButton';
import { ArrowLeftOnRectangleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import StatusButtonUpdate from '@/app/_components/StatusButtonUpdate';

import Image from "next/image";

export default async function UserProfile() {
  const session = await auth();
  const perfil = await getProfile(session.user.email);

  return (
    <div className="bg-slate-100 min-h-screen">
    <form action={updateProfile} className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white rounded-xl shadow-md p-8 space-y-6 border">
        <div className="flex items-center space-x-6">
          <Image
            src={session?.user?.image}
            alt="Imagem do usuário"
            className="w-20 h-20 rounded-full object-cover border"
            width={100}
            height={100}
            />
          <div>
            <h2 name="nomeUsuario" className="text-2xl font-bold text-gray-700">{perfil.nomeUsuario}</h2>
            <input 
              type="text" 
              name="email"
              disabled 
              defaultValue={perfil.email}
              className="mt-1 w-[400px] py-2 text-sm text-gray-700 bg-white"/>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Nacionalidade</label>
            <input
              type="text"
              name="nacionalidade"
              defaultValue={perfil.nacionalidade  || "Brasil"}
              className="mt-1 w-full border rounded-md px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Idioma</label>
            <input
              type="text"
              name="idioma"
              defaultValue={perfil.idioma || "Português (Brasil)"}
              className="mt-1 w-full border rounded-md px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Data de Criação</label>
            <input
              type="text"
              disabled
              name="created_at"
              value={new Date(perfil.created_at).toLocaleString("pt-BR")}
              className="mt-1 w-full border bg-gray-100 text-gray-500 rounded-md px-3 py-2"
              />
          </div>
        </div>
        <div className="pt-4 text-right flex justify-between">
          <StatusButtonUpdate/>
        </div>
      </div>
    </form>
    <div className="max-w-4xl mx-auto px-6 pb-12">
      <div className="flex justify-end">
        <div className="bg-indigo-700 text-white font-semibold rounded-md transition">
          <SignOutButton icon={<ArrowLeftOnRectangleIcon className="h-4 w-4" />} />
        </div>
      </div>
      </div>
    </div>
  );
}

