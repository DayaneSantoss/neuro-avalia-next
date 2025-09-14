import Navigation from './Navigation';
import Logo from './Logo';

function Header() {
  return (
    <header className='bg-primary-10 border rounded-xl px-9 py-1'>
      <div className='flex justify-between items-center mx-auto'>
        <Logo />
        <Navigation />
      </div>
    </header>
  );
}

export default Header;