'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, postAcquisition, register } from '@/lib/api-client';
import { setToken } from '@/lib/auth-token';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { Button } from '@/components/ui/Button';
import { hasAnalyticsConsent } from '@/lib/consent';

const ACQUISITION_KEY = 'first_acquisition_payload';

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const existing = localStorage.getItem(ACQUISITION_KEY);
    if (existing) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const source = (params.get('utm_source') || '').toLowerCase() || 'direct';
    const payload = {
      source,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      landingPage: window.location.pathname,
      referrer: document.referrer || undefined,
      firstVisitAt: new Date().toISOString(),
    };

    localStorage.setItem(ACQUISITION_KEY, JSON.stringify(payload));
    if (hasAnalyticsConsent()) {
      postAcquisition(payload).catch(() => undefined);
    }
  }, []);

  const getFriendlyError = (message: string) => {
    if (message.includes('Invalid credentials')) {
      return 'Email sau parola sunt incorecte. Daca nu ai cont, apasa pe "Nu ai cont? Inregistreaza-te".';
    }

    if (message.includes('Email already in use')) {
      return 'Exista deja un cont cu acest email. Incearca autentificarea.';
    }

    return 'Ceva nu a mers. Te rog incearca din nou.';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Se procesează...');

    try {
      const response =
        mode === 'register'
          ? await register({
              email,
              password,
              name,
              denomination: 'GENERAL',
              acquisition:
                typeof window !== 'undefined' && hasAnalyticsConsent()
                  ? JSON.parse(localStorage.getItem(ACQUISITION_KEY) || 'null') || undefined
                  : undefined,
            })
          : await login({ email, password });

      setToken(response.token);
      setStatus('Autentificare reușită. Redirecționare...');
      router.push('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setStatus(getFriendlyError(message));
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
          Ghid spiritual creștin cu răspunsuri blânde, rugăciuni și versete pentru fiecare zi.
        </p>
        <p className="muted">Cont demo: demo@vorbesc-cu-dumnezeu.ro / Demo1234!</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link className="button button-secondary" href="/home">
            Continuă dacă ești deja autentificat
          </Link>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setMode('login');
              setEmail('demo@vorbesc-cu-dumnezeu.ro');
              setPassword('Demo1234!');
              setStatus('Date demo completate. Apasa "Intra in cont".');
            }}
          >
            Completeaza contul demo
          </Button>
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
      <p className="muted" style={{ marginTop: -8 }}>
        <Link href="/privacy-policy">Politica de confidențialitate</Link> • <Link href="/terms">Termeni și condiții</Link> •{' '}
        <Link href="/disclaimer">Disclaimer</Link>
      </p>
    </main>
  );
}
