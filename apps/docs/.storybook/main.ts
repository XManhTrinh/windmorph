import tailwindcss from '@tailwindcss/vite';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  // favicon.ico at a static dir's root replaces Storybook's own favicon.
  staticDirs: ['./public'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    // "use client" only matters to React Server Components; a client-only bundle drops it.
    const onLog = viteConfig.build?.rolldownOptions?.onLog;
    viteConfig.build = {
      ...viteConfig.build,
      rolldownOptions: {
        ...viteConfig.build?.rolldownOptions,
        onLog(level, log, handler) {
          if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
          if (onLog) onLog(level, log, handler);
          else handler(level, log);
        },
      },
    };
    return viteConfig;
  },
};

export default config;
