'use client'
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import PacientCard from "./PacientCard";
import LoginMessage from "./LoginMessage";

// Função para gerar números de página com reticências
function getPageNumbers(currentPage, totalPages) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export default function PacientList({ pacients }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState(pacients || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // valor padrão, pode ser o que quiser


  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const resultados = pacients.filter((p) =>
      p.nomePaciente?.toLowerCase().includes(term)
    );
    setFiltered(resultados);
    setCurrentPage(1); // Resetar para página 1 quando houver busca
  }, [searchTerm, pacients]);

  if (!pacients) return <LoginMessage />;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col gap-4">
      {/* Campo de busca */}
      <div className="relative w-full mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          placeholder="Pesquisar Pacientes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 text-sm text-primary-950 placeholder-gray-500 border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex items-center justify-end gap-2 text-sm text-gray-800 mb-4">
        <label htmlFor="itemsPerPage" className="whitespace-nowrap">Pacientes por página:</label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1); // Reinicia na página 1 sempre que mudar
          }}
          className="border border-gray-300 rounded-md px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={25}>25</option>
        </select>
      </div>

      {/* Lista */}
      {currentItems.length === 0 ? (
        <div className="text-center text-sm text-gray-500">
          Nenhum paciente encontrado.
        </div>
      ) : (
        currentItems.map((pacient) => (
          <PacientCard key={pacient.id} pacient={pacient} />
        ))
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
          {getPageNumbers(currentPage, totalPages).map((page, i) =>
            typeof page === 'string' ? (
              <span key={i} className="px-3 py-2 text-sm text-gray-500">…</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 text-sm rounded-full border shadow transition-all ${
                  page === currentPage
                    ? 'bg-indigo-600 text-white border-indigo-700 font-semibold'
                    : 'bg-white text-gray-700 hover:bg-indigo-100 border-gray-300'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
