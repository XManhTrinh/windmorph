/**
 * Emits every non-colour token and the Tailwind theme mapping from the
 * TypeScript token source in `src/tokens`. Never edit the generated CSS by hand.
 */
import {
  BREAKPOINTS,
  COLOR_ROLES,
  CORNERS,
  ELEVATION_LEVELS,
  FOCUS_INDICATOR,
  LEGACY_DURATIONS,
  LEGACY_EASINGS,
  MOTION_SCHEMES,
  SHADOW_AMBIENT_OPACITY,
  SHADOW_KEY_OPACITY,
  SPRINGS,
  SPRING_FAMILIES,
  SPRING_SPEEDS,
  STATE_OPACITIES,
  TYPEFACES,
  TYPE_SCALE,
  Z_INDEX,
  springSettleDuration,
  springToLinearEasing,
  type MotionScheme,
} from '../../src/tokens';

const block = (selector: string, lines: string[]) =>
  `${selector} {\n${lines.map((line) => `  ${line}`).join('\n')}\n}`;

const shadowColor = (opacity: number) =>
  `color-mix(in srgb, var(--md-sys-color-shadow) ${opacity * 100}%, transparent)`;

function springDeclarations(scheme: MotionScheme): string[] {
  return SPRING_FAMILIES.flatMap((family) =>
    SPRING_SPEEDS.flatMap((speed) => {
      const token = SPRINGS[scheme][family][speed];
      const prefix = `--md-sys-motion-spring-${family}-${speed}`;
      return [
        `${prefix}-easing: ${springToLinearEasing(token)};`,
        `${prefix}-duration: ${springSettleDuration(token)}ms;`,
      ];
    }),
  );
}

export function generateTokensCss(): string {
  const root: string[] = [];

  for (const [name, stack] of Object.entries(TYPEFACES)) {
    root.push(`--md-ref-typeface-${name}: ${stack};`);
  }
  for (const [role, s] of Object.entries(TYPE_SCALE)) {
    const prefix = `--md-sys-typescale-${role}`;
    root.push(
      `${prefix}-font: var(--md-ref-typeface-${s.font});`,
      `${prefix}-size: ${s.size}px;`,
      `${prefix}-line-height: ${s.lineHeight}px;`,
      `${prefix}-tracking: ${s.tracking}px;`,
      `${prefix}-weight: ${s.weight};`,
    );
  }
  for (const [name, value] of Object.entries(CORNERS)) {
    root.push(`--md-sys-shape-corner-${name}: ${value};`);
  }
  for (const [name, value] of Object.entries(STATE_OPACITIES)) {
    const suffix = name.startsWith('disabled') ? 'opacity' : 'state-layer-opacity';
    root.push(`--md-sys-state-${name}-${suffix}: ${value};`);
  }
  root.push(
    `--md-sys-focus-indicator-thickness: ${FOCUS_INDICATOR.thickness};`,
    `--md-sys-focus-indicator-offset: ${FOCUS_INDICATOR.offset};`,
  );
  for (const [level, { key, ambient }] of Object.entries(ELEVATION_LEVELS)) {
    const value =
      key && ambient
        ? `${key} ${shadowColor(SHADOW_KEY_OPACITY)}, ${ambient} ${shadowColor(SHADOW_AMBIENT_OPACITY)}`
        : 'none';
    root.push(`--md-sys-elevation-level-${level}: ${value};`);
  }
  for (const [name, value] of Object.entries(Z_INDEX)) {
    root.push(`--md-sys-z-${name}: ${value};`);
  }
  for (const [name, value] of Object.entries(LEGACY_DURATIONS)) {
    root.push(`--md-sys-motion-duration-${name}: ${value}ms;`);
  }
  for (const [name, value] of Object.entries(LEGACY_EASINGS)) {
    root.push(`--md-sys-motion-easing-${name}: ${value};`);
  }

  const [defaultScheme, ...otherSchemes] = MOTION_SCHEMES;
  const sections = [
    block(':root', root),
    block(
      `:root,\n[data-motion="${defaultScheme}"]`,
      springDeclarations(defaultScheme as MotionScheme),
    ),
    ...otherSchemes.map((scheme) => block(`[data-motion="${scheme}"]`, springDeclarations(scheme))),
    `@media (prefers-reduced-motion: reduce) {\n${block(
      ':root,\n[data-motion]',
      springDeclarations('standard'),
    )}\n}`,
  ];
  return sections.join('\n\n');
}

/** Tailwind v4 theme mapping: utilities read the M3 system tokens at runtime. */
export function generateTailwindThemeCss(): string {
  const inline: string[] = [
    `--font-brand: var(--md-ref-typeface-brand);`,
    `--font-plain: var(--md-ref-typeface-plain);`,
    `--font-mono: var(--md-ref-typeface-mono);`,
  ];
  for (const role of COLOR_ROLES) {
    inline.push(`--color-${role}: var(--md-sys-color-${role});`);
  }
  for (const role of Object.keys(TYPE_SCALE)) {
    const prefix = `--md-sys-typescale-${role}`;
    inline.push(
      `--text-${role}: var(${prefix}-size);`,
      `--text-${role}--line-height: var(${prefix}-line-height);`,
      `--text-${role}--letter-spacing: var(${prefix}-tracking);`,
      `--text-${role}--font-weight: var(${prefix}-weight);`,
    );
  }
  for (const name of Object.keys(CORNERS)) {
    inline.push(`--radius-corner-${name}: var(--md-sys-shape-corner-${name});`);
  }
  for (const level of Object.keys(ELEVATION_LEVELS)) {
    inline.push(`--shadow-elevation-${level}: var(--md-sys-elevation-level-${level});`);
  }
  for (const family of SPRING_FAMILIES) {
    for (const speed of SPRING_SPEEDS) {
      inline.push(
        `--ease-m3-${family}-${speed}: var(--md-sys-motion-spring-${family}-${speed}-easing);`,
      );
    }
  }
  for (const name of Object.keys(LEGACY_EASINGS)) {
    inline.push(`--ease-m3-${name}: var(--md-sys-motion-easing-${name});`);
  }

  const breakpoints = Object.entries(BREAKPOINTS).map(
    ([name, value]) => `--breakpoint-${name}: ${value};`,
  );

  const durationUtilities = SPRING_FAMILIES.flatMap((family) =>
    SPRING_SPEEDS.map((speed) =>
      block(`@utility duration-m3-${family}-${speed}`, [
        `transition-duration: var(--md-sys-motion-spring-${family}-${speed}-duration);`,
      ]),
    ),
  );

  return [block('@theme inline', inline), block('@theme', breakpoints), ...durationUtilities].join(
    '\n\n',
  );
}
