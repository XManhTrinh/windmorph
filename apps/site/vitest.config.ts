import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['{components,content,scripts,app,lib}/**/*.test.{ts,tsx}'],
    // CI runs every package's tests at once on two shared cores, as the core's config says:
    // the same 20s limit, where Vitest's 5s default failed the search dialog's tests under load.
    testTimeout: 20_000,
  },
});
