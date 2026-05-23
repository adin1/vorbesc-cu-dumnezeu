import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { SpiritualGuideService } = require('../dist/src/modules/spiritual-guide/spiritual-guide.service.js');

test('spiritual guide returns mood-based message', async () => {
  const prisma = {
    spiritualMood: {
      findUnique: async () => ({
        id: 'm1',
        slug: 'obosit',
        name: 'Mă simt obosit/ă',
        guides: [
          {
            warmMessage: 'Un gând bun pentru tine.',
            verse: 'Matei 11:28',
            shortPrayer: 'Doamne, dă-mi odihnă.',
            reflectionQuestion: 'Ce poți lăsa în grija lui Dumnezeu azi?',
          },
        ],
      }),
      findFirst: async () => null,
      findMany: async () => [],
    },
    encouragementMessage: {
      findFirst: async () => ({ message: 'Mesaj general' }),
    },
    verse: { findMany: async () => [] },
    prayer: { findMany: async () => [] },
  };

  const service = new SpiritualGuideService(prisma);
  const result = await service.message({ moodId: 'm1' });

  assert.equal(result.warmMessage, 'Un gând bun pentru tine.');
  assert.equal(result.verse, 'Matei 11:28');
});
