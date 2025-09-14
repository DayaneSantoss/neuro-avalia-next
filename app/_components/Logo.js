import Image from 'next/image';
import Link from 'next/link';
// import logo from '@/public/logo.png';

function Logo() {
  return (
    <Link href='/' className='flex items-center gap-4 z-10'>
      <Image
        src='/logo.png'
        // src={logo}
        height='50'
        quality={100}
        width='50'
        alt='Neuro Avalia logo'
      />
      <span className='text-xl font-semibold text-indigo-700'>
        NeuroAvalia
      </span>
    </Link>
  );
}

export default Logo;