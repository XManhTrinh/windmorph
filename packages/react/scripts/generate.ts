import { fileURLToPath } from 'node:url';
import { generateThemeCss } from '../src/theme/css';
import { BUILT_IN_THEMES, DEFAULT_THEME } from '../src/tokens';
import { writeFile } from 'node:fs/promises';
import {
  componentTokenNames,
  componentsCss,
  discoverComponentTokenSets,
} from './lib/component-tokens';
import { materialShapePathFiles } from './lib/material-shape-paths';
import { generateTailwindThemeCss, generateTokensCss } from './lib/token-css';
import { writeGenerated } from './lib/write';

const packageDir = fileURLToPath(new URL('../', import.meta.url));
const outDir = fileURLToPath(new URL('../src/styles/generated/', import.meta.url));
const tokenNamesFile = new URL('../component-tokens.txt', import.meta.url);

const themesCss = Object.entries(BUILT_IN_THEMES)
  .map(([name, seed]) => generateThemeCss(name, seed, { isDefault: name === DEFAULT_THEME }))
  .join('\n\n');

const tokenSets = await discoverComponentTokenSets();

await Promise.all([
  writeGenerated(`${outDir}tokens.css`, generateTokensCss()),
  writeGenerated(`${outDir}themes.css`, themesCss),
  writeGenerated(`${outDir}theme.css`, generateTailwindThemeCss()),
  writeGenerated(`${outDir}components.css`, componentsCss(tokenSets)),
  writeFile(tokenNamesFile, `${componentTokenNames(tokenSets)}\n`),
  ...Object.entries(materialShapePathFiles()).map(([file, source]) =>
    writeFile(`${packageDir}${file}`, source),
  ),
]);

console.log(
  `Generated tokens.css, themes.css, theme.css, components.css (${tokenSets.length} component token sets) and the shape outlines`,
);
