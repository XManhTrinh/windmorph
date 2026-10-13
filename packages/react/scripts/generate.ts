import { fileURLToPath } from 'node:url';
import { generateThemeCss } from '../src/theme/css';
import { BUILT_IN_THEMES, DEFAULT_THEME } from '../src/tokens';
import { generateTailwindThemeCss, generateTokensCss } from './lib/token-css';
import { writeGenerated } from './lib/write';

const outDir = fileURLToPath(new URL('../src/styles/generated/', import.meta.url));

const themesCss = Object.entries(BUILT_IN_THEMES)
  .map(([name, seed]) => generateThemeCss(name, seed, { isDefault: name === DEFAULT_THEME }))
  .join('\n\n');

await Promise.all([
  writeGenerated(`${outDir}tokens.css`, generateTokensCss()),
  writeGenerated(`${outDir}themes.css`, themesCss),
  writeGenerated(`${outDir}theme.css`, generateTailwindThemeCss()),
]);

console.log('Generated tokens.css, themes.css and theme.css');
