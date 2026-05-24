'use client';

import { useState } from 'react';
import { Button } from './Button';

type PublishMode = 'APP_ONLY' | 'FACEBOOK_PREP';

type PrayerRequestFormProps = {
  loading?: boolean;
  onSubmit: (payload: { content: string; anonymous: boolean; publishMode: PublishMode }) => Promise<void>;
};

export function PrayerRequestForm({ loading = false, onSubmit }: PrayerRequestFormProps) {
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [publishMode, setPublishMode] = useState<PublishMode>('APP_ONLY');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length < 3) {
      return;
    }

    await onSubmit({ content: trimmed, anonymous, publishMode });
    setContent('');
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        Cererea ta
        <textarea
          rows={4}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          minLength={3}
          required
          placeholder="Scrie simplu și sincer."
        />
      </label>

      <label>
        Publicare
        <select value={publishMode} onChange={(event) => setPublishMode(event.target.value as PublishMode)}>
          <option value="APP_ONLY">Doar în aplicație</option>
          <option value="FACEBOOK_PREP">În aplicație + text pregătit pentru Facebook</option>
        </select>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
        <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
        Postează anonim
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? 'Se trimite...' : 'Trimite spre moderare'}
      </Button>
    </form>
  );
}
