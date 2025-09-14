import Image from 'next/image';
import { signInAction } from '@/app/_lib/actions';

function SignInButton() {
  return (
    <form action={signInAction}>
      <button
        className="flex items-center justify-center gap-4 w-full py-3 px-6 border border-gray-300 bg-white text-indigo-900 text-base font-semibold rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
      >
        <Image
          src="https://authjs.dev/img/providers/google.svg"
          alt="Google logo"
          width={100}
          height={100}
        />
        <span>Entrar com Google</span>
      </button>
    </form>
  );
}

export default SignInButton;
