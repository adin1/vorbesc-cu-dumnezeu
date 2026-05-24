'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PremiumFeatureCard } from '@/components/ui/PremiumFeatureCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  generatePrayer,
  getMonetizationSummary,
  getPrayers,
  saveGeneratedPrayer,
  savePrayer,
  type MonetizationSummary,
  type GeneratedPrayerResponse,
  type Prayer,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';
import { prayerCategories } from '@/lib/mock-data';

export default function PrayersPage() {
  const [items, setItems] = useState<Prayer[]>([]);
  const [topic, setTopic] = useState('');
  const [generated, setGenerated] = useState<GeneratedPrayerResponse | null>(null);
  const [status, setStatus] = useState('');
  const [savingPrayerId, setSavingPrayerId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [savingGenerated, setSavingGenerated] = useState(false);
  const [monetization, setMonetization] = useState<MonetizationSummary | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    Promise.all([getPrayers(token), getMonetizationSummary(token)])
      .then(([prayers, summary]) => {
        setItems(prayers);
        setMonetization(summary);
      })
      .catch(() => setItems([]));
  }, []);

  const handleSavePrayer = async (prayerId: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      setSavingPrayerId(prayerId);
      await savePrayer(token, prayerId);
      setStatus('Rugaciunea a fost salvata in profil.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    } finally {
      setSavingPrayerId(null);
    }
  };

  const handleGeneratePrayer = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    const trimmedTopic = topic.trim();
    if (trimmedTopic.length < 2) {
      setStatus('Introdu o tema valida (minim 2 caractere).');
      return;
    }

    try {
      setGenerating(true);
      const response = await generatePrayer(token, trimmedTopic);
      setGenerated(response);
      setStatus('Rugaciunea personalizata a fost generata.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare la generare: ${message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveGeneratedPrayer = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    if (!generated) {
      setStatus('Genereaza mai intai o rugaciune.');
      return;
    }

    try {
      setSavingGenerated(true);
      await saveGeneratedPrayer(token, {
        topic: generated.topic,
        prayer: generated.prayer,
        suggestion: generated.suggestion,
      });
      setStatus('Rugaciunea generata a fost salvata in profil.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare la salvare: ${message}`);
    } finally {
      setSavingGenerated(false);
    }
  };

  const handleCopyGenerated = async () => {
    if (!generated) {
      setStatus('Genereaza mai intai o rugaciune.');
      return;
    }

    try {
      await navigator.clipboard.writeText(`${generated.prayer}\n\nSugestie: ${generated.suggestion}`);
      setStatus('Rugaciunea a fost copiata in clipboard.');
    } catch {
      setStatus('Nu am putut copia automat. Selecteaza textul si copiaza manual.');
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Rugăciuni" subtitle="Colecție pe categorii + generare personalizată" />
      <Card>
        <h3>Categorii</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {prayerCategories.map((category) => (
            <Button
              key={category}
              type="button"
              variant="secondary"
              onClick={() => {
                setTopic(category);
                setStatus(`Tema selectata: ${category}`);
              }}
            >
              {category}
            </Button>
          ))}
        </div>
      </Card>
      <Card>
        <h3>Generează rugăciune personalizată</h3>
        <p className="muted">Introdu tema: familie, frica, boala, decizie grea etc.</p>
        <div className="form-grid" style={{ marginTop: 12 }}>
          <label>
            Tema
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Ex: familie"
              minLength={2}
            />
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button type="button" onClick={handleGeneratePrayer} disabled={generating}>
              {generating ? 'Se genereaza...' : 'Genereaza rugaciunea'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTopic('');
                setGenerated(null);
                setStatus('Campurile au fost resetate.');
              }}
            >
              Reseteaza
            </Button>
          </div>
        </div>

        {generated ? (
          <div style={{ marginTop: 16 }}>
            <p>
              <strong>Tema:</strong> {generated.topic}
            </p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{generated.prayer}</p>
            <p className="muted">Sugestie: {generated.suggestion}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button type="button" variant="secondary" onClick={handleCopyGenerated}>
                Copiaza rugaciunea
              </Button>
              <Button type="button" onClick={handleSaveGeneratedPrayer} disabled={savingGenerated}>
                {savingGenerated ? 'Se salveaza...' : 'Salveaza rugaciunea generata'}
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
      <Card>
        <h3>Rugăciuni din API</h3>
        {items.length ? (
          <ul>
            {items.slice(0, 6).map((item) => (
              <li key={item.id} style={{ marginBottom: 12 }}>
                <strong>{item.title}</strong> - {item.category.name}
                <div style={{ marginTop: 8 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSavePrayer(item.id)}
                    disabled={savingPrayerId === item.id}
                  >
                    {savingPrayerId === item.id ? 'Se salveaza...' : 'Salveaza rugaciunea'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu există încă rugăciuni încărcate.</p>
        )}
      </Card>

      <Card>
        <h3>Rugăciuni audio</h3>
        {monetization?.featureAccess.audioPrayers ? (
          <ul>
            <li>Psalmul 23 - Rugăciune de încredere</li>
            <li>Rugăciune de seară pentru pace</li>
            <li>Rugăciune pentru familie unită</li>
          </ul>
        ) : (
          <PremiumFeatureCard
            title="Rugăciunile audio fac parte din experiența Premium."
            description="Accesează momente audio liniștite, potrivite pentru meditație și rugăciune zilnică."
          />
        )}
      </Card>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
