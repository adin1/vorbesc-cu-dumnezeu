'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  addFavoriteVerse,
  deleteFavoriteVerse,
  deleteSavedPrayer,
  deleteGdprAccount,
  exportGdprData,
  getFavoriteVerses,
  getNotifications,
  getProfile,
  getSavedPrayers,
  markAllNotificationsRead,
  markNotificationRead,
  updateProfile,
  updateSpiritualPreference,
  type FavoriteVerse,
  type NotificationItem,
  type ProfileResponse,
  type Prayer,
} from '@/lib/api-client';
import { clearToken, getToken } from '@/lib/auth-token';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [status, setStatus] = useState('');

  const [name, setName] = useState('');
  const [tone, setTone] = useState('GENTLE');
  const [goal, setGoal] = useState('');
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifyCommunity, setNotifyCommunity] = useState(true);
  const [favoriteReference, setFavoriteReference] = useState('');
  const [favoriteText, setFavoriteText] = useState('');
  const [favoriteVerses, setFavoriteVerses] = useState<FavoriteVerse[]>([]);
  const [savedPrayers, setSavedPrayers] = useState<Prayer[]>([]);
  const [favoriteTotal, setFavoriteTotal] = useState(0);
  const [savedPrayersTotal, setSavedPrayersTotal] = useState(0);
  const [favoriteOffset, setFavoriteOffset] = useState(0);
  const [savedPrayersOffset, setSavedPrayersOffset] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [verseQuery, setVerseQuery] = useState('');
  const [prayerQuery, setPrayerQuery] = useState('');

  const refreshExtras = async (token: string) => {
    const [verses, prayers, notices] = await Promise.all([
      getFavoriteVerses(token, { limit: 8, offset: 0 }),
      getSavedPrayers(token, { limit: 8, offset: 0 }),
      getNotifications(token, { limit: 5, offset: 0 }),
    ]);
    setFavoriteVerses(verses.items);
    setSavedPrayers(prayers.items);
    setFavoriteTotal(verses.total);
    setSavedPrayersTotal(prayers.total);
    setFavoriteOffset(verses.items.length);
    setSavedPrayersOffset(prayers.items.length);
    setNotifications(notices.items);
  };

  const loadMoreFavoriteVerses = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    try {
      const response = await getFavoriteVerses(token, { limit: 8, offset: favoriteOffset });
      setFavoriteVerses((prev) => [...prev, ...response.items]);
      setFavoriteOffset((prev) => prev + response.items.length);
      setFavoriteTotal(response.total);
    } catch {
      setStatus('Nu am putut incarca mai multe versete favorite.');
    }
  };

  const loadMoreSavedPrayers = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    try {
      const response = await getSavedPrayers(token, { limit: 8, offset: savedPrayersOffset });
      setSavedPrayers((prev) => [...prev, ...response.items]);
      setSavedPrayersOffset((prev) => prev + response.items.length);
      setSavedPrayersTotal(response.total);
    } catch {
      setStatus('Nu am putut incarca mai multe rugaciuni salvate.');
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    getProfile(token)
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setTone(data.spiritualPreference?.preferredTone ?? 'GENTLE');
        setGoal(data.spiritualPreference?.spiritualGoal ?? '');
        setNotifyDaily(data.notifyDaily ?? true);
        setNotifyCommunity(data.notifyCommunity ?? true);
        refreshExtras(token).catch(() => undefined);
      })
      .catch(() => setProfile(null));
  }, []);

  const handleSave = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await updateProfile(token, { name, notifyDaily, notifyCommunity });
      await updateSpiritualPreference(token, {
        preferredTone: tone,
        spiritualGoal: goal,
      });
      const refreshed = await getProfile(token);
      setProfile(refreshed);
      setStatus('Profilul a fost actualizat.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleAddFavoriteVerse = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await addFavoriteVerse(token, { reference: favoriteReference, text: favoriteText });
      setFavoriteReference('');
      setFavoriteText('');
      await refreshExtras(token);
      setStatus('Verset adaugat la favorite.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleDeleteFavoriteVerse = async (id: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await deleteFavoriteVerse(token, id);
      await refreshExtras(token);
      setStatus('Verset sters din favorite.');
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
      const data = await exportGdprData(token);
      const keys = Object.keys(data).join(', ');
      setStatus(`Export GDPR generat. Sectiuni: ${keys}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Confirmi stergerea contului? Aceasta actiune este ireversibila.');
    if (!confirmed) {
      return;
    }

    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await deleteGdprAccount(token);
      clearToken();
      setProfile(null);
      setStatus('Contul a fost sters conform cererii GDPR.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await markNotificationRead(token, id);
      await refreshExtras(token);
      setStatus('Notificare marcata ca citita.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await markAllNotificationsRead(token);
      await refreshExtras(token);
      setStatus('Toate notificarile au fost marcate ca citite.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const handleDeleteSavedPrayer = async (id: string) => {
    const token = getToken();
    if (!token) {
      setStatus('Autentificarea este necesara.');
      return;
    }

    try {
      await deleteSavedPrayer(token, id);
      await refreshExtras(token);
      setStatus('Rugaciunea a fost eliminata din salvate.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare necunoscuta';
      setStatus(`Eroare: ${message}`);
    }
  };

  const filteredFavoriteVerses = favoriteVerses.filter((verse) =>
    `${verse.reference} ${verse.text}`.toLowerCase().includes(verseQuery.toLowerCase()),
  );

  const filteredSavedPrayers = savedPrayers.filter((prayer) =>
    `${prayer.title} ${prayer.content} ${prayer.category.name}`
      .toLowerCase()
      .includes(prayerQuery.toLowerCase()),
  );

  return (
    <div className="page-grid animate-in">
      <SectionHeader title="Profil" subtitle="Preferințe, progres, setări și GDPR" />
      <Card>
        <h3>Date profil</h3>
        {profile ? (
          <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
            <label>
              Nume
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Ton preferat
              <select value={tone} onChange={(event) => setTone(event.target.value)}>
                <option value="GENTLE">GENTLE</option>
                <option value="BIBLICAL">BIBLICAL</option>
                <option value="PARENTAL">PARENTAL</option>
                <option value="SIMPLE">SIMPLE</option>
              </select>
            </label>
            <label>
              Scop spiritual
              <input value={goal} onChange={(event) => setGoal(event.target.value)} />
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifyDaily}
                onChange={(event) => setNotifyDaily(event.target.checked)}
              />
              Notificari zilnice
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifyCommunity}
                onChange={(event) => setNotifyCommunity(event.target.checked)}
              />
              Notificari comunitate
            </label>
            <p className="muted">Streak zilnic: {profile.dailyStreak}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button type="button" onClick={handleSave}>
                Salveaza profil
              </Button>
              <Button type="button" variant="secondary" onClick={handleExport}>
                Export date GDPR
              </Button>
              <Button type="button" variant="secondary" onClick={handleDeleteAccount}>
                Sterge cont
              </Button>
            </div>
          </form>
        ) : (
          <p className="muted">Nu exista date de profil disponibile.</p>
        )}
      </Card>

      <Card>
        <h3>Versete favorite</h3>
        <div className="form-grid">
          <label>
            Cauta in favorite
            <input
              value={verseQuery}
              onChange={(event) => setVerseQuery(event.target.value)}
              placeholder="Cauta referinta sau text"
            />
          </label>
          <label>
            Referinta
            <input
              value={favoriteReference}
              onChange={(event) => setFavoriteReference(event.target.value)}
              placeholder="Ex: Psalmul 23:1"
            />
          </label>
          <label>
            Text verset
            <textarea
              rows={3}
              value={favoriteText}
              onChange={(event) => setFavoriteText(event.target.value)}
            />
          </label>
          <Button type="button" onClick={handleAddFavoriteVerse}>
            Adauga verset favorit
          </Button>
        </div>
        {filteredFavoriteVerses.length ? (
          <ul>
            {filteredFavoriteVerses.map((verse) => (
              <li key={verse.id} style={{ marginBottom: 10 }}>
                <strong>{verse.reference}</strong>: {verse.text}
                <div style={{ marginTop: 6 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleDeleteFavoriteVerse(verse.id)}
                  >
                    Sterge
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu exista inca versete favorite.</p>
        )}
        {favoriteVerses.length < favoriteTotal ? (
          <div style={{ marginTop: 8 }}>
            <Button type="button" variant="secondary" onClick={loadMoreFavoriteVerses}>
              Incarca mai multe versete
            </Button>
            <p className="muted">
              Afisate {favoriteVerses.length} din {favoriteTotal}
            </p>
          </div>
        ) : null}
      </Card>

      <Card>
        <h3>Rugaciuni salvate</h3>
        <label>
          Cauta in rugaciuni salvate
          <input
            value={prayerQuery}
            onChange={(event) => setPrayerQuery(event.target.value)}
            placeholder="Cauta titlu, categorie sau continut"
          />
        </label>
        {filteredSavedPrayers.length ? (
          <ul>
            {filteredSavedPrayers.map((prayer) => (
              <li key={prayer.id} style={{ marginBottom: 10 }}>
                <strong>{prayer.title}</strong> - {prayer.category.name}
                <div style={{ marginTop: 6 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleDeleteSavedPrayer(prayer.id)}
                  >
                    Elimina din salvate
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu exista inca rugaciuni salvate.</p>
        )}
        {savedPrayers.length < savedPrayersTotal ? (
          <div style={{ marginTop: 8 }}>
            <Button type="button" variant="secondary" onClick={loadMoreSavedPrayers}>
              Incarca mai multe rugaciuni
            </Button>
            <p className="muted">
              Afisate {savedPrayers.length} din {savedPrayersTotal}
            </p>
          </div>
        ) : null}
      </Card>

      <Card>
        <h3>Notificari</h3>
        <div style={{ marginBottom: 10 }}>
          <Button type="button" variant="secondary" onClick={handleMarkAllNotificationsRead}>
            Marcheaza toate ca citite
          </Button>
        </div>
        {notifications.length ? (
          <ul>
            {notifications.map((notice) => (
              <li key={notice.id} style={{ marginBottom: 10 }}>
                <strong>{notice.title}</strong>
                <div>{notice.body}</div>
                <div className="muted">
                  {new Date(notice.createdAt).toLocaleString('ro-RO')} |{' '}
                  {notice.read ? 'citita' : 'necitita'}
                </div>
                {!notice.read ? (
                  <div style={{ marginTop: 6 }}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleMarkNotificationRead(notice.id)}
                    >
                      Marcheaza ca citita
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nu exista notificari.</p>
        )}
      </Card>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
