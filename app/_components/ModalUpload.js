"use client";

import { useState } from "react";
import Image from "next/image";

export default function ModalUpload({ onClose, onUploadSuccess }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setSelectedFileName(file.name);

    onUploadSuccess(file); // envia o arquivo real pro componente pai
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-lg font-bold mb-4 text-center text-indigo-700">Selecione uma imagem</h2>

        <label
          htmlFor="fileInput"
          className="mb-4 block w-full cursor-pointer bg-indigo-600 text-white py-2 px-4 rounded text-center transition-transform hover:scale-105"
        >
          Selecionar Arquivo
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedImage && (
          <div className="mt-4 flex flex-col items-center">
            <Image
              src={selectedImage}
              alt="Pré-visualização"
              className="w-32 h-32 object-cover rounded-full border border-gray-300 shadow"
              width={10}
              height={10}
            />
            <span className="mt-2 text-sm text-gray-600 text-center break-words">{selectedFileName}</span>
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-start">
          <button
            className="text-sm px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
            onClick={onClose}
          >
            Fechar
          </button>

          <button
            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded hover:scale-105 hover:bg-indigo-700 transition-transform duration-200"
            onClick={onClose}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
