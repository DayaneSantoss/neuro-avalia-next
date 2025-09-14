function LoginMessage() {
  return (
    <div className="min-h-[20vh] flex items-center justify-center text-indigo-900 px-4">
      <div className="text-center space-y-6">
        <p className="text-base font-semibold">
          É necessário estar logado para visualizar os pacientes.
        </p>
        <a
          href="/login"
          className="
            inline-block
            px-6 py-3
            bg-indigo-600
            text-white
            text-base
            font-bold
            rounded-xl
            transition-transform
            duration-200
            hover:bg-indigo-700
            hover:scale-105
            shadow-md
          "
        >
          Realizar login
        </a>
      </div>
    </div>
  );
}

export default LoginMessage;
