'use client';

import { useState } from 'react';
import { Button } from './Button';

type FacebookShareBoxProps = {
  text: string;
};

export function FacebookShareBox({ text }: FacebookShareBoxProps) {
  const [status, setStatus] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Textul a fost copiat.');
    } catch {
      setStatus('Nu am putut copia automat.');
    }
  };

  return (
    <div className="card" style={{ marginTop: 10 }}>
      <strong>Text pregătit pentru grupul Facebook</strong>
      <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button type="button" variant="secondary" onClick={handleCopy}>
          Copiază textul
        </Button>
        <a
          className="button button-secondary"
          href="https://www.facebook.com/groups/723709163928296"
          target="_blank"
          rel="noreferrer"
        >
          Deschide grupul Facebook
        </a>
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
