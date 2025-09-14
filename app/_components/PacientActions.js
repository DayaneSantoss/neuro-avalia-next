'use client';
import { useState } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import Link from "next/link";
import { deletePacient } from '@/app/_lib/actions';
import Modal from '@/app/_components/Modal';

export default function PacientActions({ pacientId, pacientName }) {
  const [showModal, setShowModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmationText.trim().toLowerCase() === pacientName.trim().toLowerCase()) {
      await deletePacient(pacientId);
      setShowModal(false);
    } else {
      setError("O nome digitado não confere.");
    }
  };

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Link href={`/pacientes/${pacientId}/editar`}>
          <PencilSquareIcon className="h-5 w-5 text-indigo-600 hover:text-indigo-700" />
        </Link>
        <button onClick={() => setShowModal(true)}>
          <TrashIcon className="h-5 w-5 text-indigo-600 hover:text-indigo-700" />
        </button>
      </div>

      {showModal && (
        <Modal>
          <h2 className="text-xl font-bold text-primary-800 mb-4">Confirmação de exclusão</h2>
          <p className="mb-3 text-primary-800">
            Para confirmar a exclusão do paciente <strong>{pacientName}</strong>, digite o nome completo dele(a) no campo abaixo.
          </p>
          <input
            type="text"
            className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={confirmationText}
            onChange={(e) => {
              setConfirmationText(e.target.value);
              setError("");
            }}
            placeholder="Digite o nome do paciente"
          />
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-indigo-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Sim, excluir
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
