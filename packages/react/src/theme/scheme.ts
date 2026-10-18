import {
  Blend,
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  SchemeExpressive,
  SchemeNeutral,
  SchemeTonalSpot,
  SchemeVibrant,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
  type DynamicColor,
} from '@material/material-color-utilities';
import {
  COLOR_ROLES,
  CONTRAST_LEVELS,
  CUSTOM_COLORS,
  CUSTOM_COLOR_ROLES,
  DEFAULT_CUSTOM_COLORS,
  PALETTE_NAMES,
  SCHEME_VARIANTS,
  type ColorRole,
  type ContrastLevel,
  type CustomColorName,
  type PaletteName,
  type PaletteSource,
  type SchemeVariant,
  type ThemePalettes,
  type ThemeSeed,
} from '../tokens/color';

const SCHEMES = {
  'tonal-spot': SchemeTonalSpot,
  neutral: SchemeNeutral,
  vibrant: SchemeVibrant,
  expressive: SchemeExpressive,
} satisfies Record<SchemeVariant, unknown>;

const HEX_COLOR = /^#(?:[0-9a-f]{3}){1,2}$/i;

const toCamelCase = (role: string) => role.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

const dynamicColors = new MaterialDynamicColors();

function roleColor(role: ColorRole): DynamicColor {
  const method = toCamelCase(role) as keyof MaterialDynamicColors;
  const factory = dynamicColors[method];
  if (typeof factory !== 'function') {
    throw new Error(`[@windmorph/react] Unknown colour role "${role}".`);
  }
  const color = (factory as () => DynamicColor | undefined).call(dynamicColors);
  if (!color)
    throw new Error(`[@windmorph/react] Colour role "${role}" is not defined by the 2025 spec.`);
  return color;
}

export function assertHexColor(value: string): void {
  if (!HEX_COLOR.test(value)) {
    throw new Error(
      `[@windmorph/react] Expected a hex colour like "#6750A4", received "${value}".`,
    );
  }
}

const isSchemeVariant = (source: string): source is SchemeVariant =>
  (SCHEME_VARIANTS as readonly string[]).includes(source);

/** The `DynamicScheme` field that holds each palette. */
const PALETTE_FIELDS = {
  primary: 'primaryPalette',
  secondary: 'secondaryPalette',
  tertiary: 'tertiaryPalette',
  error: 'errorPalette',
  neutral: 'neutralPalette',
  neutralVariant: 'neutralVariantPalette',
} as const satisfies Record<PaletteName, keyof DynamicScheme>;

function assertPalettes(palettes: ThemePalettes): void {
  for (const [name, source] of Object.entries(palettes)) {
    if (!(PALETTE_NAMES as readonly string[]).includes(name)) {
      throw new Error(
        `[@windmorph/react] Unknown palette "${name}". Use one of ${PALETTE_NAMES.join(', ')}.`,
      );
    }
    if (typeof source !== 'string' || (!isSchemeVariant(source) && !HEX_COLOR.test(source))) {
      throw new Error(
        `[@windmorph/react] The ${name} palette needs a scheme variant (${SCHEME_VARIANTS.join(', ')}) or a hex colour like "#00A07A", received "${String(source)}".`,
      );
    }
  }
}

function variantScheme(
  seed: Hct,
  variant: SchemeVariant,
  isDark: boolean,
  contrast: ContrastLevel,
): DynamicScheme {
  return new SCHEMES[variant](seed, isDark, CONTRAST_LEVELS[contrast], '2025');
}

function createScheme(
  { seed, variant, palettes }: Pick<ThemeSeed, 'seed' | 'variant' | 'palettes'>,
  isDark: boolean,
  contrast: ContrastLevel,
): DynamicScheme {
  assertHexColor(seed);
  const sourceColor = Hct.fromInt(argbFromHex(seed));
  const scheme = variantScheme(sourceColor, variant, isDark, contrast);
  const overrides = Object.entries(palettes ?? {}) as [PaletteName, PaletteSource][];
  if (overrides.length === 0) return scheme;
  assertPalettes(palettes ?? {});

  // Every palette starts as the variant's own; each override replaces one. Roles still take
  // their tones from the theme's variant, so the spec's contrast rules hold.
  const paletteFrom = (name: PaletteName, source: PaletteSource): TonalPalette =>
    isSchemeVariant(source)
      ? variantScheme(sourceColor, source, isDark, contrast)[PALETTE_FIELDS[name]]
      : TonalPalette.fromInt(argbFromHex(source));
  const chosen = Object.fromEntries(
    PALETTE_NAMES.map((name) => [PALETTE_FIELDS[name], scheme[PALETTE_FIELDS[name]]]),
  ) as Record<(typeof PALETTE_FIELDS)[PaletteName], TonalPalette>;
  for (const [name, source] of overrides) chosen[PALETTE_FIELDS[name]] = paletteFrom(name, source);

  return new DynamicScheme({
    sourceColorHct: sourceColor,
    variant: scheme.variant,
    isDark,
    contrastLevel: CONTRAST_LEVELS[contrast],
    specVersion: scheme.specVersion,
    platform: scheme.platform,
    ...chosen,
  });
}

/** The same scheme with another palette in the error slot. */
function withErrorPalette(scheme: DynamicScheme, palette: TonalPalette): DynamicScheme {
  return new DynamicScheme({
    sourceColorHct: scheme.sourceColorHct,
    variant: scheme.variant,
    isDark: scheme.isDark,
    contrastLevel: scheme.contrastLevel,
    specVersion: scheme.specVersion,
    platform: scheme.platform,
    primaryPalette: scheme.primaryPalette,
    secondaryPalette: scheme.secondaryPalette,
    tertiaryPalette: scheme.tertiaryPalette,
    neutralPalette: scheme.neutralPalette,
    neutralVariantPalette: scheme.neutralVariantPalette,
    errorPalette: palette,
  });
}

/**
 * A custom colour's four roles (docs/plans/custom-colors.md): its tonal palette, harmonised
 * toward the seed unless turned off, takes the error roles' tone rules, so it has the
 * contrast M3 guarantees for error in every mode and at every contrast level.
 */
function customColorRoles(
  scheme: DynamicScheme,
  name: CustomColorName,
  color: string,
  harmonize: boolean,
): Partial<Record<ColorRole, string>> {
  assertHexColor(color);
  const argb = argbFromHex(color);
  const palette = TonalPalette.fromInt(
    harmonize ? Blend.harmonize(argb, scheme.sourceColorHct.toInt()) : argb,
  );
  const custom = withErrorPalette(scheme, palette);
  const tone = (color: DynamicColor) => hexFromArgb(color.getArgb(custom));
  return {
    [name]: tone(dynamicColors.error()),
    [`on-${name}`]: tone(dynamicColors.onError()),
    [`${name}-container`]: tone(dynamicColors.errorContainer()),
    [`on-${name}-container`]: tone(dynamicColors.onErrorContainer()),
  };
}

const isCustomRole = (role: ColorRole) =>
  (CUSTOM_COLOR_ROLES as readonly ColorRole[]).includes(role);

/** Resolves every colour role to a hex value using the 2025 colour spec. */
export function generateSchemeColors(
  seed: ThemeSeed,
  isDark: boolean,
  contrast: ContrastLevel,
): Record<ColorRole, string> {
  const scheme = createScheme(seed, isDark, contrast);
  const colors: Partial<Record<ColorRole, string>> = Object.fromEntries(
    COLOR_ROLES.filter((role) => !isCustomRole(role)).map((role) => [
      role,
      hexFromArgb(roleColor(role).getArgb(scheme)),
    ]),
  );
  for (const name of CUSTOM_COLORS) {
    Object.assign(
      colors,
      customColorRoles(
        scheme,
        name,
        seed.customColors?.[name] ?? DEFAULT_CUSTOM_COLORS[name],
        seed.harmonize ?? true,
      ),
    );
  }
  return colors as Record<ColorRole, string>;
}
