import type { ColorRole } from './color';
import type { SpringFamily, SpringSpeed } from './motion';
import type { CornerName } from './shape';
import type { TypeRole } from './typography';

/*
 * Component tokens: every value a component paints, as a CSS variable an app can set.
 *
 * A component's tokens file defines a set with `defineComponentTokens`, and its package's
 * `generate` script writes the CSS with `componentTokensCss` (Windmorph Pro's to its
 * `generated/components.css`). Each token is two variables:
 *
 * - `--<name>-<token>`, the public one, unset by default. An app sets it on the component
 *   (`className`) or on any ancestor, globally or per theme.
 * - `--_<name>-<token>`, the resolved one, which the component's classes read. It is set on
 *   the element marked `data-tokens="<name>"` to the public variable, falling back to the
 *   default for that element's `data-size`, `data-variant` (or any other `data-*` state).
 *
 * So a component's classes never hold a number or a colour of their own, and sizes and
 * variants only change variables.
 */

/** A token's default, as CSS. Use the helpers below, so it reads the system tokens. */
export type TokenValue = string;

export interface ComponentToken {
  /** The default, usually a system token. */
  value: TokenValue;
  /** What it paints, for the docs site's token table. */
  description: string;
}

export interface ComponentTokenSet<Token extends string = string> {
  /** The variable prefix and `data-tokens` value: `wm-message-field`, later `md-comp-…`. */
  name: string;
  tokens: Readonly<Record<Token, ComponentToken>>;
  /**
   * Defaults that change with a `data-*` attribute on the same element:
   * `{ size: { sm: { height: px(40) } } }` applies on `[data-size="sm"]`.
   */
  states?: Readonly<
    Record<string, Readonly<Record<string, Readonly<Partial<Record<Token, TokenValue>>>>>>
  >;
  /**
   * Private values worked out from the tokens (`--_<name>-<key>`), such as a corner capped
   * at half the height. Not themeable themselves: set the tokens they come from.
   */
  derived?: Readonly<Record<string, TokenValue>>;
}

export function defineComponentTokens<Token extends string>(
  set: ComponentTokenSet<Token>,
): ComponentTokenSet<Token> {
  return set;
}

/** The variable a component's classes read for `token`: `var(--_<name>-<token>)`. */
export const resolvedToken = (set: ComponentTokenSet, token: string) =>
  `var(--_${set.name}-${token})`;

/** A colour role's variable, for a token's default: `color('primary')`. */
export const color = (role: ColorRole): TokenValue => `var(--md-sys-color-${role})`;

/** A colour role at an opacity, as M3's disabled states (`on-surface` at 12% or 38%). */
export const colorAt = (role: ColorRole, opacity: number): TokenValue =>
  `color-mix(in srgb, var(--md-sys-color-${role}) ${Math.round(opacity * 100)}%, transparent)`;

/** A corner-scale step's variable: `corner('large')`. */
export const corner = (name: CornerName): TokenValue => `var(--md-sys-shape-corner-${name})`;

/** A length in px (Compose dp map to CSS px 1:1): `px(56)`. */
export const px = (value: number): TokenValue => `${value}px`;

/** One property of a type-scale role: `typescale('body-large', 'size')`. */
export const typescale = (
  role: TypeRole,
  property: 'font' | 'size' | 'line-height' | 'tracking' | 'weight',
): TokenValue => `var(--md-sys-typescale-${role}-${property})`;

/** A motion spring's duration or easing: `spring('spatial', 'fast', 'easing')`. */
export const spring = (
  family: SpringFamily,
  speed: SpringSpeed,
  part: 'duration' | 'easing',
): TokenValue => `var(--md-sys-motion-spring-${family}-${speed}-${part})`;

/** The five `text-*` tokens for one type role. */
export const typeTokens = (role: TypeRole) =>
  ({
    'text-font': typescale(role, 'font'),
    'text-size': typescale(role, 'size'),
    'text-line-height': typescale(role, 'line-height'),
    'text-tracking': typescale(role, 'tracking'),
    'text-weight': typescale(role, 'weight'),
  }) as const;

/** The CSS for one set: the resolved variables, then each state's defaults. */
export function componentTokensCss(set: ComponentTokenSet): string {
  const element = `[data-tokens~="${set.name}"]`;
  const declarations = (values: Readonly<Record<string, TokenValue | undefined>>) =>
    Object.entries(values).flatMap(([token, value]) =>
      value === undefined
        ? []
        : [`  --_${set.name}-${token}: var(--${set.name}-${token}, ${value});`],
    );
  const rule = (selector: string, lines: string[]) =>
    lines.length ? [`:where(${selector}) {\n${lines.join('\n')}\n}`] : [];

  const base = declarations(
    Object.fromEntries(
      Object.entries<ComponentToken>(set.tokens).map(([token, { value }]) => [token, value]),
    ),
  );
  const derived = Object.entries(set.derived ?? {}).map(
    ([key, value]) => `  --_${set.name}-${key}: ${value};`,
  );
  const states = Object.entries(set.states ?? {}).flatMap(([attribute, values]) =>
    Object.entries(values).flatMap(([state, overrides]) =>
      rule(`${element}[data-${attribute}="${state}"]`, declarations(overrides)),
    ),
  );
  return [...rule(element, [...base, ...derived]), ...states].join('\n\n');
}
