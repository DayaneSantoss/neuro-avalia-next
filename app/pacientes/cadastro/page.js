"use client";

import { useState, useRef } from "react";
import { registerPacient } from "@/app/_lib/actions";
import InputMask from "react-input-mask";
import { useFormStatus } from "react-dom";
import { ArrowLeft, User, Edit2 } from "lucide-react";
import ModalUpload from "@/app/_components/ModalUpload";
import Image from "next/image";

export default function CadastrarPacientes() {
  const [dataNascimento, setDataNascimento] = useState("");
  const [status, setStatus] = useState("");
  const [erro, setErro] = useState("");
  const [tipoIntervencao, setTipoIntervencao] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfErro, setCpfErro] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null); // para preview
  const [selectedFile, setSelectedFile] = useState(null);   // o arquivo real

  // Referência para o input file oculto
  const inputFileRef = useRef(null);

  // Função para abrir/fechar modal
  function toggleModal() {
    setIsModalOpen(!isModalOpen);
  }

  // Quando recebe arquivo do modal
  function handleUploadSuccess(file) {
    setSelectedImage(URL.createObjectURL(file));
    setSelectedFile(file);

    // Preenche o input file oculto com o arquivo real
    if (inputFileRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      inputFileRef.current.files = dataTransfer.files;
    }
  }

  const calcularIdade = (dataNascimento) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesNascimento = nascimento.getMonth();
    const mesAtual = hoje.getMonth();

    if (
      mesAtual < mesNascimento ||
      (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())
    ) {
      idade--;
    }
    return idade;
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 relative">
      <div className="max-w-3xl mx-auto">
        <a
          href="/pacientes"
          className="fixed top-20 left-4 inline-flex items-center text-base font-bold text-indigo-600 bg-gray-200 px-3 py-2 rounded-md shadow-sm transition-transform transform hover:scale-105 hover:bg-indigo-100 z-20"
          style={{ minWidth: "90px" }}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </a>

        <h2 className="text-2xl font-bold text-white mb-10 px-8 py-4 rounded-lg bg-indigo-400 w-full max-w-3xl shadow-md border border-indigo-800">
          Cadastro de Pacientes
        </h2>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 w-full max-w-3xl">
          <form action={registerPacient} method="post" encType="multipart/form-data" className="space-y-6">
            {erro && <div className="text-red-500 font-medium">{erro}</div>}

            {/* Avatar com preview da imagem */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="w-28 h-28 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 text-7xl shadow-md">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover"
                    width={10}
                    height={10}
                  />
                ) : (
                  <User className="w-16 h-16" />
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleModal();
                }}
                className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-md focus:outline-none"
                aria-label="Editar imagem do usuário"
                type="button"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>

            <Input label="Nome Completo *" name="nomePaciente" required placeholder="Nome completo do paciente" />

            <Input
              label="Data de Nascimento *"
              name="dataNascimento"
              type="date"
              required
              onChange={(e) => setDataNascimento(e.target.value)}
            />

            <Select
              label="Gênero *"
              name="sexo"
              required
              options={[
                { value: "", label: "Selecione um gênero" },
                { value: "masculino", label: "Masculino" },
                { value: "feminino", label: "Feminino" },
                { value: "outro", label: "Outro" },
              ]}
            />

            {calcularIdade(dataNascimento) < 18 && (
              <>
                <Input label="Nome do Responsável *" name="nomeResponsavel" required />
                <Input label="Escola *" name="escola" required />
                <Input label="Série *" name="serie" required />
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <InputMask
                mask="(99) 99999-9999"
                name="telefone"
                required
                placeholder="(00) 00000-0000"
              >
                {(inputProps) => <Input {...inputProps} />}
              </InputMask>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
              <InputMask
                mask="999.999.999-99"
                value={cpf}
                name="cpf"
                required
                onChange={(e) => {
                  setCpf(e.target.value);
                  setCpfErro("");
                }}
                onBlur={() => {
                  if (!validarCPF(cpf)) setCpfErro("CPF inválido");
                }}
              >
                {(inputProps) => <Input {...inputProps} />}
              </InputMask>
              {cpfErro && <p className="text-red-500 text-sm mt-1">{cpfErro}</p>}
            </div>

            <Input label="Email *" name="email" type="email" required placeholder="exemplo@email.com" />

            <Input label="Endereço" name="endereco" placeholder="Rua, número, bairro..." />

            <Select
              label="Status *"
              name="status"
              required
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "", label: "Selecione o status" },
                { value: "Avaliação", label: "Avaliação" },
                { value: "Intervenção", label: "Intervenção" },
              ]}
            />

            {status === "Avaliação" && (
              <Textarea
                label="Queixa principal"
                name="queixa"
                placeholder="Descreva o motivo pelo qual a avaliação foi solicitada: dificuldades percebidas, comportamentos observados ou solicitações da escola/profissional."
              />
            )}

            {status === "Intervenção" && (
              <>
                <Select
                  label="Tipo de Intervenção *"
                  name="tipoIntervencao"
                  required
                  onChange={(e) => setTipoIntervencao(e.target.value)}
                  options={[
                    { value: "", label: "Selecione o Tipo de Intervenção" },
                    { value: "comLaudo", label: "Apresenta Laudo" },
                    { value: "semLaudo", label: "Sem Laudo" },
                  ]}
                />

                {tipoIntervencao === "comLaudo" && (
                  <Textarea
                    label="Descrição do Laudo"
                    name="descricaoLaudo"
                    placeholder="Descreva brevemente o conteúdo do laudo apresentado, incluindo diagnóstico, observações ou recomendações."
                  />
                )}

                {tipoIntervencao === "semLaudo" && (
                  <Textarea
                    label="Histórico da Queixa"
                    name="queixa"
                    placeholder="Descreva desde quando os sinais ou dificuldades começaram, quais comportamentos preocupam e o que já foi feito até agora."
                  />
                )}
                <Textarea
                  label="Motivo da Intervenção"
                  name="motivoIntervencao"
                  placeholder="Descreva o foco terapêutico ou objetivo atual do atendimento"
                />
              </>
            )}

            <Textarea label="Observações" name="observacoes" placeholder="Informações adicionais..." />

            {/* INPUT FILE OCULTO para a imagem real */}
            <input type="file" name="imagem" ref={inputFileRef} className="hidden" />

            <div className="pt-6 text-right">
              <StatusButtonAdd />
            </div>
          </form>
        </div>

        {isModalOpen && (
          <ModalUpload
            onClose={() => setIsModalOpen(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </div>
    </div>
  );
}

function StatusButtonAdd() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition"
      disabled={pending}
    >
      {pending ? "Cadastrando..." : "Cadastrar Paciente"}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        {...props}
        className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        {...props}
        className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={4}
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        {...props}
        className="w-full bg-white border border-gray-300 text-gray-900 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(cpf[10]);
}
