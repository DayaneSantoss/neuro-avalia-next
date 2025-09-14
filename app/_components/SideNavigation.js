import Link from "next/link"
import {
  HomeIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import SignOutButton from './SignOutButton';

const navLinks = [
  {
    name: 'Home',
    href: '/conta',
    icon: <HomeIcon className='h-5 w-5 text-primary-600'/>
  },
  {
    name: 'Pacientes',
    href: '/pacientes',
    icon: <UserIcon className='h-5 w-5 text-primary-600'/>
  }
]

function SideNavigation() {
  return (
    <nav className='border-r border-primary-900'>
      <ul className='flex flex-col gap-2 h-full text-base py-8'>
        {navLinks.map((link) => (
          <li key={link.name}>
            <Link className={`py-2 px-5 hover:bg-primary-900 hover:text-primary-100 transition-colors flex items-center gap-4 text-primary-200 hover:rounded-lg`} href={link.href}>
            {link.icon}
            <span>{link.name}</span>
            </Link>
          </li>
        ))}
        <li className="mt-auto">
          <SignOutButton/>
        </li>
      </ul>
    </nav>
  )
}
export default SideNavigation;