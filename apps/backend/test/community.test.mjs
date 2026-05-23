import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CommunityService } = require('../dist/src/modules/community/community.service.js');

test('community prayer request flow', async () => {
  const prisma = {
    prayerRequest: {
      findMany: async () => [{ id: 'r1', content: 'Rugați-vă pentru mine', supports: [] }],
      create: async ({ data }) => ({ id: 'r2', ...data }),
      update: async () => ({ id: 'r1', status: 'REPORTED' }),
    },
    prayerSupport: {
      upsert: async ({ create }) => ({ id: 's1', ...create }),
    },
  };

  const dashboardCache = { invalidateUser: () => 1 };
  const service = new CommunityService(prisma, dashboardCache);

  const listed = await service.listRequests();
  assert.equal(listed.length, 1);

  const created = await service.createRequest('u1', 'Am nevoie de pace', true);
  assert.equal(created.userId, 'u1');

  const supported = await service.support('u2', 'r2');
  assert.equal(supported.userId, 'u2');
});
