import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import rehypeCodeBlock from './lib/rehype-code-block';

const nextConfig: NextConfig = {
  output: 'export',
  // The dev-mode Playwright project runs `next dev` with its own build directory, so it can
  // run while a developer's own `next dev` (which holds the `.next` dev lock) is open.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  // No next/image is used in this phase; a later phase that adds one must set
  // images.unoptimized = true, which output: 'export' requires.
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [rehypeCodeBlock],
  },
});

export default withMDX(nextConfig);
