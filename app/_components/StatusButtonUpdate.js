'use client';

import { useFormStatus } from 'react-dom';
import { ArrowPathIcon } from "@heroicons/react/24/solid";

export default function StatusButtonUpdate() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="bg-indigo-600 hover:bg-indigo-400 text-white font-semibold px-5 py-2 rounded-md flex items-center gap-2 transition"
      disabled={pending}
    >
      <ArrowPathIcon className="h-5 w-5" />
      {pending ? "Alterando..." : "Alterar Perfil"}
    </button>
  );
}

