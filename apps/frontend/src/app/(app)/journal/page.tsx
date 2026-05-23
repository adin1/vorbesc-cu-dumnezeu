'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  createJournalEntry,
  deleteJournalEntry,
  exportJournalEntries,
  getJournalEntries,
  type JournalEntry,
  updateJournalEntry,
} from '@/lib/api-client';
import { getToken } from '@/lib/auth-token';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ mood: '', burden: '', gratitude: '', prayerToday: '' });
  const [status, setStatus] = useState('');

  const loadEntries = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    try {
      const data = await getJournalEntries(token);
      setEntries(data);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const resetForm = () => {
    setForm({ mood: '', burden: '', gratitude: '', prayerToday: '' });
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      if (editingId) {
        await updateJournalEntry(token, editingId, form);
        setStatus('Intrarea a fost actualizata.');
      } else {
        await createJournalEntry(token, form);
        setStatus('Intrarea a fost creata.');
      }
      resetForm();
      await loadEntries();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await deleteJournalEntry(token, id);
      setStatus('Intrarea a fost stearsa.');
      await loadEntries();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleExport = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      const data = await exportJournalEntries(token);
      setStatus(`Export JSON disponibil (${data.json.length} intrari). PDF: ${data.pdfPlaceholder}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Jurnal spiritual" subtitle="Intrari zilnice private, istoric, cautare, export" />

      <Card>
        <h3>{editingId ? 'Editeaza intrarea' : 'Intrare noua'}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Stare sufleteasca
            <input
              value={form.mood}
              onChange={(event) => setForm((prev) => ({ ...prev, mood: event.target.value }))}
              required
            />
          </label>
          <label>
            Ce ma apasa
            <textarea
              rows={3}
              value={form.burden}
              onChange={(event) => setForm((prev) => ({ ...prev, burden: event.target.value }))}
              required
            />
          </label>
          <label>
            Pentru ce sunt recunoscator/recunoscatoare
            <textarea
              rows={3}
              value={form.gratitude}
              onChange={(event) => setForm((prev) => ({ ...prev, gratitude: event.target.value }))}
              required
            />
          </label>
          <label>
            Rugaciunea mea de azi
            <textarea
              rows={3}
              value={form.prayerToday}
              onChange={(event) => setForm((prev) => ({ ...prev, prayerToday: event.target.value }))}
              required
            />
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button type="submit">{editingId ? 'Salveaza modificarile' : 'Adauga in jurnal'}</Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Anuleaza editarea
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card>
        <h3>Istoric</h3>
        {entries.length ? (
          <ul>
            {entries.map((entry) => (
              <li key={entry.id} style={{ marginBottom: 12 }}>
                <strong>{entry.mood}</strong>
                <div className="muted">{new Date(entry.createdAt).toLocaleString('ro-RO')}</div>
                <div>{entry.burden}</div>
                <div>{entry.gratitude}</div>
                <div>{entry.prayerToday}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(entry.id);
                      setForm({
                        mood: entry.mood,
                        burden: entry.burden,
                        gratitude: entry.gratitude,
                        prayerToday: entry.prayerToday,
                      });
                    }}
                  >
                    Editeaza
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => handleDelete(entry.id)}>
                    Sterge
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu exista inca intrari in jurnal.</p>
        )}
      </Card>

      <Card>
        <h3>Export</h3>
        <p className="muted">Export JSON/PDF pentru arhiva personala si GDPR.</p>
        <Button type="button" onClick={handleExport}>
          Ruleaza export
        </Button>
      </Card>

      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
