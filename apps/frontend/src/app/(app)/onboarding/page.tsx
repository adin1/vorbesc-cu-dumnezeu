'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { updateSpiritualPreference } from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

const confessions = ['ORTHODOX', 'CATHOLIC', 'PROTESTANT', 'GENERAL'];
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
  const [confession, setConfession] = useState('GENERAL');
  const [tone, setTone] = useState('GENTLE');
  const [goal, setGoal] = useState('liniste');
  const [status, setStatus] = useState('');

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await updateSpiritualPreference(token, {
        confession,
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
            Confesiune
            <select value={confession} onChange={(event) => setConfession(event.target.value)}>
              {confessions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

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
    </div>
  );
}
