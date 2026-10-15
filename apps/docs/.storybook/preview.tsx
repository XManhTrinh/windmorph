import '@fontsource-variable/roboto-flex/full.css';
import type { Decorator, Preview } from '@storybook/react-vite';
import {
  BUILT_IN_THEME_NAMES,
  COLOR_MODES,
  CONTRAST_LEVEL_NAMES,
  DENSITIES,
  MOTION_SCHEMES,
  ThemeScope,
  type ColorMode,
  type ContrastLevel,
  type Density,
  type MotionScheme,
} from '@windmorph/react';
import './preview.css';

type ToolbarIcon = 'paintbrush' | 'contrast' | 'eye' | 'lightning' | 'transfer' | 'component';

const toolbar = (title: string, icon: ToolbarIcon, items: readonly string[]) => ({
  toolbar: { title, icon, items: [...items], dynamicTitle: true },
});

/**
 * Renders every story inside a ThemeScope driven by the toolbar. The page font is set on
 * `#storybook-root` (preview.css), not here: a ThemeScope's classes also go on the wrappers
 * of overlays opened inside it, and the stories' overlays render in the document's font.
 */
const withTheme: Decorator = (Story, { globals }) => (
  <ThemeScope
    theme={globals.theme as string}
    mode={globals.mode as ColorMode}
    contrast={globals.contrast as ContrastLevel}
    motion={globals.motion as MotionScheme}
    density={Number(globals.density ?? 0) as Density}
    dir={globals.dir as 'ltr' | 'rtl'}
    className="min-h-screen bg-surface p-6"
  >
    <Story />
  </ThemeScope>
);

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: toolbar('Theme', 'paintbrush', BUILT_IN_THEME_NAMES),
    mode: toolbar('Mode', 'contrast', COLOR_MODES),
    contrast: toolbar('Contrast', 'eye', CONTRAST_LEVEL_NAMES),
    motion: toolbar('Motion', 'lightning', MOTION_SCHEMES),
    dir: toolbar('Direction', 'transfer', ['ltr', 'rtl']),
    density: toolbar('Density', 'component', DENSITIES.map(String)),
  },
  initialGlobals: {
    theme: 'baseline',
    mode: 'light',
    contrast: 'standard',
    motion: 'expressive',
    dir: 'ltr',
    density: '0',
  },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
};

export default preview;
