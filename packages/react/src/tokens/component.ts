import type { ColorRole } from './color';
import type { ElevationLevel } from './elevation';
import type { SpringFamily, SpringSpeed } from './motion';
import type { CornerName } from './shape';
import type { TypeRole } from './typography';

/*
 * Component tokens: every value a component paints, as a CSS variable an app can set.
 *
 * A component's tokens file defines a set with `defineComponentTokens`, and its package's
 * `generate` script writes the CSS with `componentTokensCss` (the core's and Windmorph Pro's
 * to their `generated/components.css`). Each token is two variables:
 *
 * - the public one, unset by default. An app sets it on the component (`className`) or on
 *   any ancestor, globally or per theme. A set's own tokens are `--<name>-<token>`; a scoped
 *   token (below) is `--<scope prefix>-<token>`, so M3's names can put the variant or size
 *   in the component segment (`--md-comp-filled-card-container-color`).
 * - `--_<name>-<token>`, the resolved one, which the component's classes read. It is set on
 *   the element marked `data-tokens="<name>"` to the public variable, falling back to the
 *   default for that element's `data-size`, `data-variant` (or any other `data-*` state).
 *
 * So a component's classes read one private variable per part, and sizes and variants only
 * change which public variable and default fill it.
 */

/** A token's default, as CSS. Use the helpers below, so it reads the system tokens. */
export type TokenValue = string;

/**
 * Where a token shows, for the tests that set it and check the result: the element (the
 * component's root, or the element with `data-slot="<slot>"` inside it), the computed CSS
 * property, and the `data-*` state the element must be in.
 */
export interface TokenPaints {
  /** The `data-slot` of the element it paints. The component's root when omitted. */
  slot?: string;
  /** The CSS property, as `getComputedStyle` names it: `background-color`. */
  property: string;
  /** A state attribute the element needs, without `data-`: `selected`. */
  state?: string;
}

export interface ComponentToken {
  /** The default, usually a system token. */
  value: TokenValue;
  /** What it paints, for the docs site's token table. */
  description: string;
  /** The Jetpack Compose token it matches (`FilledCardTokens.ContainerColor`), for the docs. */
  compose?: string;
  /** Where it shows, for the token tests. */
  paints?: TokenPaints;
}

/**
 * One value of a scoping attribute (`data-variant="filled"`): the public prefix of its
 * tokens, its tokens, and the private values it sets without a public name.
 */
export interface ComponentTokenScope {
  /** The public prefix: `md-comp-filled-card` gives `--md-comp-filled-card-<token>`. */
  prefix: string;
  /** Tokens with a public name, `--<prefix>-<token>`, read as `--_<set name>-<token>`. */
  tokens?: Readonly<Record<string, ComponentToken>>;
  /** Private-only values (`--_<set name>-<token>`): not themeable and not documented. */
  fixed?: Readonly<Record<string, TokenValue>>;
}

export interface ComponentTokenSet<Token extends string = string> {
  /** The private prefix and `data-tokens` value: `md-comp-card`, `wm-message-field`. */
  name: string;
  /** Tokens with one public name, `--<name>-<token>`, whatever the element's state. */
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
  /**
   * Tokens whose public name depends on a `data-*` attribute on the same element:
   * `{ variant: { filled: { prefix: 'md-comp-filled-card', tokens: { 'container-color': … } } } }`
   * applies on `[data-variant="filled"]` and is set as `--md-comp-filled-card-container-color`.
   * Every value of an attribute declares the same private variables (a token or a `fixed`
   * value each), so a nested component never inherits its parent's.
   */
  scopes?: Readonly<Record<string, Readonly<Record<string, ComponentTokenScope>>>>;
}

/** A public variable of a set, as the docs, the tests and the generated name list read it. */
export interface PublicComponentToken extends ComponentToken {
  /** The variable an app sets: `--md-comp-filled-card-container-color`. */
  name: string;
  /** The part the component's classes read, `--_<set name>-<token>`: `container-color`. */
  token: string;
  /** For a scoped token, the attribute (without `data-`) and value it applies on. */
  scope?: { attribute: string; value: string };
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

/** An elevation level's shadow: `elevation(1)`. */
export const elevation = (level: ElevationLevel): TokenValue =>
  `var(--md-sys-elevation-level-${level})`;

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

/** Whether a value is a component token set, for code that discovers them in a module. */
export function isComponentTokenSet(value: unknown): value is ComponentTokenSet {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ComponentTokenSet).name === 'string' &&
    typeof (value as ComponentTokenSet).tokens === 'object' &&
    (value as ComponentTokenSet).tokens !== null
  );
}

/** Every public variable of a set: its own tokens, then each scope value's, in order. */
export function componentTokenList(set: ComponentTokenSet): PublicComponentToken[] {
  const own = Object.entries<ComponentToken>(set.tokens).map(([token, entry]) => ({
    ...entry,
    name: `--${set.name}-${token}`,
    token,
  }));
  const scoped = Object.entries(set.scopes ?? {}).flatMap(([attribute, values]) =>
    Object.entries(values).flatMap(([value, scope]) =>
      Object.entries(scope.tokens ?? {}).map(([token, entry]) => ({
        ...entry,
        name: `--${scope.prefix}-${token}`,
        token,
        scope: { attribute, value },
      })),
    ),
  );
  return [...own, ...scoped];
}

/** The CSS for one set: the resolved variables, then each state's and scope's defaults. */
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
  const scopes = Object.entries(set.scopes ?? {}).flatMap(([attribute, values]) =>
    Object.entries(values).flatMap(([value, scope]) =>
      rule(`${element}[data-${attribute}="${value}"]`, [
        ...Object.entries(scope.tokens ?? {}).map(
          ([token, entry]) =>
            `  --_${set.name}-${token}: var(--${scope.prefix}-${token}, ${entry.value});`,
        ),
        ...Object.entries(scope.fixed ?? {}).map(
          ([token, fixed]) => `  --_${set.name}-${token}: ${fixed};`,
        ),
      ]),
    ),
  );
  return [...rule(element, [...base, ...derived]), ...states, ...scopes].join('\n\n');
}
