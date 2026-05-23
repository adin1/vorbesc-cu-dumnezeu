'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getPrayers, savePrayer, type Prayer } from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';
import { prayerCategories } from '@/lib/mock-data';

export default function PrayersPage() {
  const [items, setItems] = useState<Prayer[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    getPrayers(token).then(setItems).catch(() => setItems([]));
  }, []);

  const handleSavePrayer = async (prayerId: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await savePrayer(token, prayerId);
      setStatus('Rugaciunea a fost salvata in profil.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Rugăciuni" subtitle="Colecție pe categorii + generare personalizată" />
      <Card>
        <h3>Categorii</h3>
        <p className="muted">{prayerCategories.join(' • ')}</p>
      </Card>
      <Card>
        <h3>Generează rugăciune personalizată</h3>
        <p className="muted">Introduceți tema: familie, frică, boală, decizie grea etc.</p>
      </Card>
      <Card>
        <h3>Rugăciuni din API</h3>
        {items.length ? (
          <ul>
            {items.slice(0, 6).map((item) => (
              <li key={item.id} style={{ marginBottom: 12 }}>
                <strong>{item.title}</strong> - {item.category.name}
                <div style={{ marginTop: 8 }}>
                  <Button type="button" variant="secondary" onClick={() => handleSavePrayer(item.id)}>
                    Salveaza rugaciunea
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu există încă rugăciuni încărcate.</p>
        )}
      </Card>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
