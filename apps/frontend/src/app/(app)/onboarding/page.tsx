'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { updateSpiritualPreference } from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';
import { appendUtm, socialConfig } from '@/lib/social-config';

const tones = ['GENTLE', 'BIBLICAL', 'PARENTAL', 'SIMPLE'];
const goals = [
  'liniste',
  'rugaciune',
  'familie',
  'iertare',
  'decizii',
  'anxietate',
  'copii',
  'recunostinta',
];

export default function OnboardingPage() {
  const [tone, setTone] = useState('GENTLE');
  const [goal, setGoal] = useState('liniste');
  const [status, setStatus] = useState('');
  const tiktokUrl = appendUtm(socialConfig.urls.tiktok, socialConfig.utm.tiktok.landing);
  const facebookUrl = socialConfig.urls.facebook
    ? appendUtm(socialConfig.urls.facebook, socialConfig.utm.facebook.landing)
    : '';

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await updateSpiritualPreference(token, {
        preferredTone: tone,
        spiritualGoal: goal,
      });
      setStatus('Preferintele au fost salvate.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Onboarding spiritual" subtitle="Preferințe inițiale pentru ghidare personalizată" />
      <Card>
        <h3>Alege preferintele</h3>
        <form className="form-grid" onSubmit={handleSave}>
          <label>
            Ton raspuns
            <select value={tone} onChange={(event) => setTone(event.target.value)}>
              {tones.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            Scop spiritual
            <select value={goal} onChange={(event) => setGoal(event.target.value)}>
              {goals.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit">Salveaza onboarding</Button>
        </form>
        {status ? <p className="muted">{status}</p> : null}
      </Card>

      <Card>
        <h3>Conectează-te cu comunitatea</h3>
        <p className="muted">Pentru inspirație zilnică și sprijin, poți continua în Social Hub.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="button" href="/social">
            Social Hub
          </Link>
          <a className="button button-secondary" href={tiktokUrl} target="_blank" rel="noreferrer noopener">
            TikTok
          </a>
          {facebookUrl ? (
            <a className="button button-secondary" href={facebookUrl} target="_blank" rel="noreferrer noopener">
              Facebook
            </a>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
