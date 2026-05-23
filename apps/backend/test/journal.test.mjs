import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JournalService } = require('../dist/src/modules/journal/journal.service.js');

test('journal CRUD basic flow', async () => {
  const entries = [{ id: 'j1', userId: 'u1', mood: 'Liniștit', burden: 'x', gratitude: 'y', prayerToday: 'z' }];

  const prisma = {
    journalEntry: {
      findMany: async () => entries,
      create: async ({ data }) => ({ id: 'j2', ...data }),
      update: async ({ data }) => ({ id: 'j1', userId: 'u1', ...data }),
      delete: async () => ({ id: 'j1' }),
    },
  };

  const dashboardCache = { invalidateUser: () => 1 };
  const service = new JournalService(prisma, dashboardCache);

  const listed = await service.list('u1');
  assert.equal(listed.length, 1);

  const created = await service.create('u1', {
    mood: 'Obosit',
    burden: 'Multă presiune',
    gratitude: 'Familie',
    prayerToday: 'Pace',
  });
  assert.equal(created.userId, 'u1');

  const updated = await service.update('u1', 'j1', { mood: 'Mai bine' });
  assert.equal(updated.mood, 'Mai bine');

  const removed = await service.delete('u1', 'j1');
  assert.equal(removed.id, 'j1');
});
