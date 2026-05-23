'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, register } from '@/lib/api-client';
import { setToken } from '@/lib/auth-token';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Se procesează...');

    try {
      const response =
        mode === 'register'
          ? await register({ email, password, name, denomination: 'GENERAL' })
          : await login({ email, password });

      setToken(response.token);
      setStatus('Autentificare reușită. Redirecționare...');
      router.push('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscută';
      setStatus(`Eroare: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-grid">
      <section className="hero animate-in">
        <h1 style={{ marginTop: 0, fontFamily: 'var(--font-serif)', fontSize: 46 }}>
          Vorbește cu Dumnezeu
        </h1>
        <p>
          Companion spiritual AI care oferă răspunsuri inspirate din Biblie, rugăciune și reflecție
          creștină.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link className="button button-secondary" href="/home">
            Continuă dacă ești deja autentificat
          </Link>
        </div>
      </section>

      <section className="card animate-in">
        <h3 style={{ marginTop: 0 }}>{mode === 'login' ? 'Autentificare' : 'Înregistrare'}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label>
              Nume
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Parolă
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button type="submit" disabled={loading}>
              {mode === 'login' ? 'Intră în cont' : 'Creează cont'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Nu ai cont? Înregistrează-te' : 'Ai cont? Autentifică-te'}
            </Button>
          </div>
          {status ? <p className="muted">{status}</p> : null}
        </form>
      </section>

      <Disclaimer />
    </main>
  );
}
