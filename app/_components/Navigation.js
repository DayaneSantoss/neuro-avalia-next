import Link from 'next/link';
import { auth } from "@/app/_lib/auth";
import Image from "next/image";

export default async function Navigation() {
  const session = await auth();

  return (
    <nav className="z-10 bg-white ">
      <ul className="flex gap-8 items-center justify-center">
        {[
          { href: '/', label: 'Início' },
          { href: '/pacientes', label: 'Meus Pacientes' },
          { href: '/agenda', label: 'Agenda' },
          { href: '/financeiro', label: 'Financeiro' },
        ].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="
                inline-block
                px-4 py-2
                rounded-xl
                text-indigo-700
                hover:bg-indigo-100
                hover:scale-105
                transition-transform transition-colors transition-font-size
                duration-200
                font-bold
              "
            >
              {item.label}
            </Link>
          </li>
        ))}

        <li>
          {session?.user?.image ? (
            <Link
              href="/conta"
              className="
                flex items-center gap-3
                px-3 py-2
                rounded-xl
                hover:bg-indigo-100
                hover:scale-105
                transition-transform transition-colors
                duration-200
              "
            >
              <Image
                className="h-9 w-9 rounded-full border border-indigo-200"
                src={session.user.image}
                alt={session.user.name}
                referrerPolicy="no-referrer"
                width={10}
                height={10}
              />
            </Link>
          ) : (
            <Link
              href="/conta"
              className="
                inline-block
                px-4 py-2
                rounded-xl
                bg-indigo-600
                text-white
                hover:bg-indigo-700
                hover:scale-105
                transition-transform transition-colors transition-font-size
                duration-200
                shadow-sm
                font-bold
              "
            >
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
