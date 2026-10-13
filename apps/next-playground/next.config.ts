import type { NextConfig } from 'next';

const config: NextConfig = {
  // The dev-mode Playwright project runs `next dev` with its own build directory.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
};

export default config;
