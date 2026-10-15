import type { NextConfig } from 'next';

const config: NextConfig = {
  // The dev-mode Playwright project runs `next dev` with its own build directory.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // `next dev` doesn't write its AGENTS.md notes file into this app.
  agentRules: false,
};

export default config;
