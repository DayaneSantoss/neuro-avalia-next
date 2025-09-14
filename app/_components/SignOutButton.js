import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { signOutAction } from '@/app/_lib/actions';

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button className='py-3 px-5 hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-4 text-white w-full hover:rounded-lg'>
        <ArrowRightOnRectangleIcon className='h-5 w-5 text-white'/>
        <span>Sair</span>
      </button>
    </form>
  );
}

export default SignOutButton;