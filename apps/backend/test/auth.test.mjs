import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { AuthService } = require('../dist/src/modules/auth/auth.service.js');

test('auth register and login', async () => {
  const users = new Map();

  const prisma = {
    user: {
      findUnique: async ({ where }) => {
        if (where.email) {
          return users.get(where.email) ?? null;
        }
        return null;
      },
      create: async ({ data }) => {
        const user = {
          id: 'u1',
          email: data.email,
          passwordHash: data.passwordHash,
          name: data.name,
          denomination: data.denomination,
        };
        users.set(user.email, user);
        return user;
      },
    },
    notification: {
      create: async () => ({}),
    },
  };

  const jwtService = {
    signAsync: async ({ sub, email }) => `token-${sub}-${email}`,
  };
  const dashboardCache = {
    invalidateUser: () => 1,
  };

  const auth = new AuthService(prisma, jwtService, dashboardCache);
  const registered = await auth.register({
    email: 'demo-test@example.com',
    password: 'Demo1234!',
    name: 'Demo Test',
    denomination: 'GENERAL',
  });

  assert.ok(registered.token.startsWith('token-u1-'));
  assert.equal(registered.user.email, 'demo-test@example.com');

  const storedUser = users.get('demo-test@example.com');
  assert.ok(storedUser);
  assert.notEqual(storedUser.passwordHash, 'Demo1234!');

  const loggedIn = await auth.login({ email: 'demo-test@example.com', password: 'Demo1234!' });
  assert.ok(loggedIn.token.startsWith('token-u1-'));
});
