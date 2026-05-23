'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth-token';

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsAuthed(Boolean(token));
    setIsChecking(false);

    if (!token) {
      router.replace('/');
    }
  }, [router]);

  if (isChecking) {
    return <p className="muted">Se verifică autentificarea...</p>;
  }

  if (!isAuthed) {
    return (
      <section className="card">
        <h3>Autentificare necesară</h3>
        <p className="muted">Pentru a continua în aplicație, te rugăm să te autentifici.</p>
        <Link className="button" href="/">
          Mergi la autentificare
        </Link>
      </section>
    );
  }

  return <>{children}</>;
}
