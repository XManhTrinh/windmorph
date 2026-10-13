import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    // CI runs every package's tests at once on two cores, so heavy tests (theme colour
    // checks, interaction tests) can pass 5s there while taking well under 1s locally.
    testTimeout: 20_000,
    // Its published ESM has extensionless imports, which Node's loader rejects.
    server: { deps: { inline: ['@material/material-color-utilities'] } },
  },
});
