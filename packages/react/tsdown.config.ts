import { defineConfig } from 'tsdown';

const COLOR_UTILITIES = /^node_modules\/.*?@material\/material-color-utilities\//;

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    primitives: 'src/primitives.ts',
    next: 'src/next.ts',
    cli: 'src/cli.ts',
  },
  format: 'esm',
  platform: 'neutral',
  target: 'es2023',
  // Preserve modules so per-file "use client" directives survive and consumers tree-shake.
  unbundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  // The colour library ships ESM with extensionless imports that plain Node cannot
  // load, so it is bundled into our output instead of being a runtime dependency.
  noExternal: ['@material/material-color-utilities'],
  external: [/^node:/],
  inputOptions: {
    onLog(level, log, handler) {
      // Directives are preserved per module in unbundle mode; scripts/check-dist.ts verifies it.
      if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
      handler(level, log);
    },
  },
  outputOptions: {
    // npm never publishes nested node_modules folders, so vendored modules get a stable path.
    entryFileNames: (chunk) =>
      `${chunk.name.replace(COLOR_UTILITIES, 'vendor/material-color-utilities/')}.js`,
  },
});
