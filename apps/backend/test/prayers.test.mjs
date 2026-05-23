import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PrayersService } = require('../dist/src/modules/prayers/prayers.service.js');

test('prayers list returns items', async () => {
  const prisma = {
    prayerCategory: { findMany: async () => [{ id: 'c1', name: 'Liniște' }] },
    prayer: {
      findMany: async () => [{ id: 'p1', title: 'Rugăciune', content: 'Doamne...', category: { name: 'Liniște' } }],
      findUnique: async () => null,
      create: async () => ({}),
    },
    notification: { create: async () => ({}) },
  };
  const dashboardCache = { invalidateUser: () => 1 };
  const service = new PrayersService(prisma, dashboardCache);

  const items = await service.list();
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Rugăciune');
});
