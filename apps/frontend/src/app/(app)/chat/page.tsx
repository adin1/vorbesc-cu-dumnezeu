'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { aiChat, type ChatResponse } from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChat = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesară.');
      return;
    }

    setLoading(true);
    setStatus('Se generează răspunsul...');

    try {
      const result = await aiChat(token, message);
      setResponse(result);
      setStatus('Răspuns pregătit.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare necunoscută';
      setStatus(`Eroare: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader
        title="Chat spiritual AI"
        subtitle="Companion spiritual AI care oferă răspunsuri inspirate din Biblie"
      />
      <Card>
        <h3>Mesajul tău</h3>
        <form className="form-grid" onSubmit={handleChat}>
          <label>
            Scrie liber ce porți în suflet
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              minLength={2}
              rows={5}
              placeholder="Ex: Sunt neliniștit(ă) și am nevoie de pace."
            />
          </label>
          <Button type="submit" disabled={loading}>
            Trimite către companionul spiritual AI
          </Button>
          {status ? <p className="muted">{status}</p> : null}
        </form>
      </Card>

      {response ? (
        <Card>
          <h3>Răspuns structurat AI</h3>
          <ol>
            <li>{response.structured.warmMessage}</li>
            <li>{response.structured.verse}</li>
            <li>{response.structured.prayer}</li>
            <li>{response.structured.reflectionQuestion}</li>
          </ol>
          <p className="muted">{response.disclaimer}</p>
        </Card>
      ) : null}

      <Card>
        <h3>Safety guardrails</h3>
        <p className="muted">
          Crize, autovătămare, abuz, violență, depresie severă: recomandare ajutor imediat
          real.
        </p>
      </Card>
    </div>
  );
}
