import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Force process exit after tests so supertest's open HTTP handles don't hang
    dangerouslyForceExit: true,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
