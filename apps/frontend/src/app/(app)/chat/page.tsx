'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Disclaimer } from '@/components/ui/Disclaimer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  getSpiritualMoods,
  sendSpiritualMessage,
  type SpiritualGuideMood,
  type SpiritualGuideResponse,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [moods, setMoods] = useState<SpiritualGuideMood[]>([]);
  const [selectedMoodId, setSelectedMoodId] = useState('');
  const [response, setResponse] = useState<SpiritualGuideResponse | null>(null);
  const [status, setStatus] = useState('Se încarcă...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesară.');
      return;
    }

    getSpiritualMoods(token)
      .then((data) => {
        setMoods(data);
        setStatus('Alege o stare sufletească sau scrie un mesaj.');
      })
      .catch(() => setStatus('Ceva nu a mers. Te rog încearcă din nou.'));
  }, []);

  const handleChat = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesară.');
      return;
    }

    setLoading(true);
    setStatus('Se încarcă...');

    try {
      const result = await sendSpiritualMessage(token, {
        moodId: selectedMoodId || undefined,
        userText: message || undefined,
      });
      setResponse(result);
      setStatus('Răspuns pregătit.');
    } catch {
      setStatus('Ceva nu a mers. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader
        title="Ghid spiritual"
        subtitle="Răspunsuri blânde și creștine, pregătite pentru starea ta sufletească"
      />
      <Card>
        <h3>Spune ce porți în suflet</h3>
        <form className="form-grid" onSubmit={handleChat}>
          <label>
            Starea ta sufletească
            <select value={selectedMoodId} onChange={(event) => setSelectedMoodId(event.target.value)}>
              <option value="">Alege o stare (opțional)</option>
              {moods.map((mood) => (
                <option key={mood.id} value={mood.id}>
                  {mood.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Scrie liber ce porți în suflet
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              placeholder="Ex: Sunt neliniștit(ă) și am nevoie de pace."
            />
          </label>
          <Button type="submit" disabled={loading || (!message.trim() && !selectedMoodId)}>
            Trimite
          </Button>
          {status ? <p className="muted">{status}</p> : null}
        </form>
      </Card>

      {response ? (
        <Card>
          <h3>Răspunsul pentru tine</h3>
          <p>
            <strong>Gând pentru tine:</strong> {response.warmMessage}
          </p>
          <p>
            <strong>Verset:</strong> {response.verse}
          </p>
          <p>
            <strong>Rugăciune:</strong> {response.prayer}
          </p>
          <p>
            <strong>Întrebare pentru suflet:</strong> {response.reflectionQuestion}
          </p>
        </Card>
      ) : null}
      <Disclaimer />
    </div>
  );
}
