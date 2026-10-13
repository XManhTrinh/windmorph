/**
 * M3 type scale, including the Expressive emphasized variants
 * (Compose `TypeScaleTokens`; sp → px 1:1).
 *
 * Each role becomes `--md-sys-typescale-<role>-{font,size,line-height,tracking,weight}`
 * and a Tailwind `text-<role>` utility that sets size, line height, tracking and weight.
 */

export const TYPEFACES = {
  brand: '"Roboto Flex", Roboto, system-ui, -apple-system, "Segoe UI", sans-serif',
  plain: '"Roboto Flex", Roboto, system-ui, -apple-system, "Segoe UI", sans-serif',
  /** Code: `font-mono`, the rich text's `code` and code blocks. The font is the app's to load. */
  mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
} as const;

export type Typeface = keyof typeof TYPEFACES;

export interface TypeStyle {
  font: Typeface;
  /** px */
  size: number;
  /** px */
  lineHeight: number;
  /** px */
  tracking: number;
  weight: 400 | 500 | 700;
}

const style = (
  font: Typeface,
  size: number,
  lineHeight: number,
  tracking: number,
  weight: TypeStyle['weight'],
): TypeStyle => ({ font, size, lineHeight, tracking, weight });

export const TYPE_SCALE = {
  'display-large': style('brand', 57, 64, -0.2, 400),
  'display-medium': style('brand', 45, 52, 0, 400),
  'display-small': style('brand', 36, 44, 0, 400),
  'headline-large': style('brand', 32, 40, 0, 400),
  'headline-medium': style('brand', 28, 36, 0, 400),
  'headline-small': style('brand', 24, 32, 0, 400),
  'title-large': style('brand', 22, 28, 0, 400),
  'title-medium': style('plain', 16, 24, 0.2, 500),
  'title-small': style('plain', 14, 20, 0.1, 500),
  'body-large': style('plain', 16, 24, 0.5, 400),
  'body-medium': style('plain', 14, 20, 0.2, 400),
  'body-small': style('plain', 12, 16, 0.4, 400),
  'label-large': style('plain', 14, 20, 0.1, 500),
  'label-medium': style('plain', 12, 16, 0.5, 500),
  'label-small': style('plain', 11, 16, 0.5, 500),

  'display-large-emphasized': style('brand', 57, 64, 0, 500),
  'display-medium-emphasized': style('brand', 45, 52, 0, 500),
  'display-small-emphasized': style('brand', 36, 44, 0, 500),
  'headline-large-emphasized': style('brand', 32, 40, 0, 500),
  'headline-medium-emphasized': style('brand', 28, 36, 0, 500),
  'headline-small-emphasized': style('brand', 24, 32, 0, 500),
  'title-large-emphasized': style('brand', 22, 28, 0, 500),
  'title-medium-emphasized': style('plain', 16, 24, 0.15, 700),
  'title-small-emphasized': style('plain', 14, 20, 0.1, 700),
  'body-large-emphasized': style('plain', 16, 24, 0.15, 500),
  'body-medium-emphasized': style('plain', 14, 20, 0.25, 500),
  'body-small-emphasized': style('plain', 12, 16, 0.4, 500),
  'label-large-emphasized': style('plain', 14, 20, 0.1, 700),
  'label-medium-emphasized': style('plain', 12, 16, 0.5, 700),
  'label-small-emphasized': style('plain', 11, 16, 0.5, 700),
} as const satisfies Record<string, TypeStyle>;

/** An M3 type-scale role, such as `body-large` or `title-medium-emphasized`. */
export type TypeRole = keyof typeof TYPE_SCALE;
export const TYPE_ROLES = Object.keys(TYPE_SCALE) as TypeRole[];
