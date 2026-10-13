import type { ThemeDefinition } from '@windmorph/react';

/**
 * Colour roles of a theme's light, standard-contrast scheme as hex values, for places outside
 * the page's CSS, such as the generated link-preview images. Read from the theme's own
 * generated CSS, whose first rule is that scheme, so they always match what the site shows.
 */
export function lightThemeColors<Role extends string>(
  theme: ThemeDefinition,
  roles: readonly Role[],
): Record<Role, string> {
  const block = /^[^{]*\{([^}]*)\}/.exec(theme.css)?.[1];
  if (!block?.includes('color-scheme: light')) {
    throw new Error(`The ${theme.name} theme's CSS does not start with its light scheme`);
  }
  const values = new Map(
    [...block.matchAll(/--md-sys-color-([a-z-]+):\s*(#[0-9a-f]{6});/gi)].map(
      ([, role, hex]) => [role, hex] as const,
    ),
  );
  return Object.fromEntries(
    roles.map((role) => {
      const hex = values.get(role);
      if (!hex) throw new Error(`The ${theme.name} theme has no ${role} colour`);
      return [role, hex];
    }),
  ) as Record<Role, string>;
}
