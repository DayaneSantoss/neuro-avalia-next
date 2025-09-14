import SignInButton from "@/app/_components/SignInButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-indigo-800">Bem-vindo!</h1>
        <p className="text-base text-gray-600">
          Use sua conta do Google para acessar o sistema
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
