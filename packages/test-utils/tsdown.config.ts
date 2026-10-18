import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    axe: 'src/axe.ts',
    setup: 'src/setup.ts',
    'tailwind-classes': 'src/tailwind-classes.ts',
  },
  format: 'esm',
  platform: 'node',
  target: 'es2023',
  dts: true,
  clean: true,
  // .js and .d.ts, as the package's exports name them (the package is ESM).
  fixedExtension: false,
});
