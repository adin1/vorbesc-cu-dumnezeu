'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth-token';

const links = [
  { href: '/home', label: 'Home' },
  { href: '/chat', label: 'Chat spiritual AI' },
  { href: '/prayers', label: 'Rugăciuni' },
  { href: '/journal', label: 'Jurnal' },
  { href: '/plans', label: 'Planuri' },
  { href: '/community', label: 'Comunitate' },
  { href: '/notifications', label: 'Notificari' },
  { href: '/profile', label: 'Profil' },
];

export function AppNav() {
  const router = useRouter();

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  return (
    <nav className="nav" aria-label="Navigare principală">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
      <button className="button button-secondary" type="button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
