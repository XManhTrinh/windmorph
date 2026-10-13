import {
  CUSTOM_COLORS,
  PALETTE_NAMES,
  type CustomColorName,
  type PaletteSource,
  type ThemePalettes,
} from '../tokens/color';

/** `neutralVariant` → `neutral-variant`, the spelling the CLI shows. */
export function toKebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Reads `<name>=<source>` entries (the CLI's `--palette` values) into `ThemePalettes`.
 * Names may be kebab- or camel-case. Sources are checked later by `createTheme`.
 */
export function parsePalettes(entries: readonly string[]): ThemePalettes {
  const palettes: ThemePalettes = {};
  for (const entry of entries) {
    const separator = entry.indexOf('=');
    const rawName = separator === -1 ? entry : entry.slice(0, separator);
    const source = separator === -1 ? '' : entry.slice(separator + 1).trim();
    const name = PALETTE_NAMES.find(
      (candidate) => candidate === rawName.trim() || toKebabCase(candidate) === rawName.trim(),
    );
    if (!name || source === '') {
      throw new Error(
        `--palette expects <name>=<source> with a name from ${PALETTE_NAMES.map(toKebabCase).join(', ')}, received "${entry}".`,
      );
    }
    palettes[name] = source as PaletteSource;
  }
  return palettes;
}

/**
 * Reads `<name>=<hex>` entries (the CLI's `--custom` values) into custom colours, for
 * `success` and `warning`. Colours are checked later by `createTheme`.
 */
export function parseCustomColors(
  entries: readonly string[],
): Partial<Record<CustomColorName, `#${string}`>> {
  const colors: Partial<Record<CustomColorName, `#${string}`>> = {};
  for (const entry of entries) {
    const [rawName = '', color = ''] = entry.split('=').map((part) => part.trim());
    const name = CUSTOM_COLORS.find((candidate) => candidate === rawName);
    if (!name || !color.startsWith('#')) {
      throw new Error(
        `--custom expects <name>=<hex> with a name from ${CUSTOM_COLORS.join(', ')}, received "${entry}".`,
      );
    }
    colors[name] = color as `#${string}`;
  }
  return colors;
}
