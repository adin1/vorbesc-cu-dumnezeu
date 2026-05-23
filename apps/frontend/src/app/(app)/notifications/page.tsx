'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [status, setStatus] = useState('');

  const pageSize = 10;

  const load = async (nextOffset = 0, append = false) => {
    const token = getToken();
    if (!token) {
      return;
    }

    try {
      const response = await getNotifications(token, {
        limit: pageSize,
        offset: nextOffset,
        unreadOnly,
      });
      setItems((prev) => (append ? [...prev, ...response.items] : response.items));
      setTotal(response.total);
      setOffset(nextOffset + response.items.length);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    load(0, false);
  }, [unreadOnly]);

  const handleRead = async (id: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await markNotificationRead(token, id);
      await load(0, false);
      setStatus('Notificare marcata ca citita.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleReadAll = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await markAllNotificationsRead(token);
      await load(0, false);
      setStatus('Toate notificarile au fost marcate ca citite.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Notificari" subtitle="Activitate recenta si mesaje importante" />
      <Card>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button type="button" variant="secondary" onClick={handleReadAll}>
            Marcheaza toate ca citite
          </Button>
          <label>
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
            />
            Afiseaza doar necitite
          </label>
        </div>
      </Card>
      <Card>
        {items.length ? (
          <ul>
            {items.map((item) => (
              <li key={item.id} style={{ marginBottom: 12 }}>
                <strong>{item.title}</strong>
                <div>{item.body}</div>
                <div className="muted">
                  {new Date(item.createdAt).toLocaleString('ro-RO')} |{' '}
                  {item.read ? 'citita' : 'necitita'}
                </div>
                {!item.read ? (
                  <div style={{ marginTop: 8 }}>
                    <Button type="button" variant="secondary" onClick={() => handleRead(item.id)}>
                      Marcheaza ca citita
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu exista notificari disponibile.</p>
        )}
      </Card>
      {items.length < total ? (
        <Card>
          <Button type="button" variant="secondary" onClick={() => load(offset, true)}>
            Incarca mai multe
          </Button>
          <p className="muted">
            Afisate {items.length} din {total}
          </p>
        </Card>
      ) : null}
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
