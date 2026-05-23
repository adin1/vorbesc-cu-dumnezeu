import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PlansService } = require('../dist/src/modules/plans/plans.service.js');

test('plans list returns plans', async () => {
  const prisma = {
    spiritualPlan: {
      findMany: async () => [{ id: 'pl1', title: '7 zile pentru liniște', durationDays: 7, days: [] }],
      findUnique: async () => null,
    },
    userPlanProgress: {
      create: async () => ({}),
      update: async () => ({}),
    },
  };

  const service = new PlansService(prisma);
  const plans = await service.list();
  assert.equal(plans.length, 1);
  assert.equal(plans[0].durationDays, 7);
});
