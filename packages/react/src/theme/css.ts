import {
  CONTRAST_LEVEL_NAMES,
  type ContrastLevel,
  type ResolvedColorMode,
  type ThemeSeed,
} from '../tokens/color';
import { generateSchemeColors } from './scheme';

const THEME_NAME = /^[a-z][a-z0-9-]*$/;

export function assertThemeName(name: string): void {
  if (!THEME_NAME.test(name)) {
    throw new Error(
      `[@windmorph/react] Theme names must be lowercase kebab-case (e.g. "acme-blue"), received "${name}".`,
    );
  }
}

export interface ThemeCssOptions {
  /** Contrast levels to emit. Defaults to all three. */
  contrastLevels?: readonly ContrastLevel[];
  /** Also apply this theme where no `data-theme` attribute is set. */
  isDefault?: boolean;
}

/**
 * Selectors for one theme × contrast × mode block.
 * A missing `data-contrast` behaves like `standard`; a missing `data-mode` like `light`;
 * the default theme also applies to a root without `data-theme`.
 */
function selectors(
  name: string,
  contrast: ContrastLevel,
  mode: ResolvedColorMode | 'system',
  isDefault: boolean,
): string {
  const themeParts = [`[data-theme="${name}"]`];
  if (isDefault) themeParts.push(':root:not([data-theme])');
  const contrastParts = [`[data-contrast="${contrast}"]`];
  if (contrast === 'standard') contrastParts.push(':not([data-contrast])');
  const modePart = mode === 'light' ? '' : `[data-mode="${mode}"]`;

  return themeParts
    .flatMap((theme) => contrastParts.map((c) => `${theme}${c}${modePart}`))
    .join(',\n');
}

function declarations(seed: ThemeSeed, mode: ResolvedColorMode, contrast: ContrastLevel): string {
  const colors = generateSchemeColors(seed, mode === 'dark', contrast);
  const lines = Object.entries(colors).map(([role, hex]) => `  --md-sys-color-${role}: ${hex};`);
  lines.unshift(`  color-scheme: ${mode};`);
  return lines.join('\n');
}

/**
 * CSS for one colour theme: light, dark and system mode for each contrast level,
 * keyed on the `data-theme`, `data-mode` and `data-contrast` attributes.
 */
export function generateThemeCss(
  name: string,
  seed: ThemeSeed,
  { contrastLevels = CONTRAST_LEVEL_NAMES, isDefault = false }: ThemeCssOptions = {},
): string {
  assertThemeName(name);
  const blocks: string[] = [];
  for (const contrast of contrastLevels) {
    const light = declarations(seed, 'light', contrast);
    const dark = declarations(seed, 'dark', contrast);
    blocks.push(`${selectors(name, contrast, 'light', isDefault)} {\n${light}\n}`);
    blocks.push(`${selectors(name, contrast, 'dark', isDefault)} {\n${dark}\n}`);
    blocks.push(
      `@media (prefers-color-scheme: dark) {\n${selectors(name, contrast, 'system', isDefault)} {\n${dark}\n}\n}`,
    );
  }
  return blocks.join('\n\n');
}
