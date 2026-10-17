import type { ComponentType, ReactElement } from 'react';
import type { ControlGroup, ControlKind, NumberRange } from '../controls-model';

/** Sets one control's value from the preview, e.g. `open` when a dialog is dismissed. */
export type PlaygroundUpdate = (name: string, value: unknown) => void;

export interface PlaygroundDescriptor {
  /** Public component name as imported from '@windmorph/react', e.g. 'Button'. */
  component: string;
  /**
   * The live element to render; receives the current prop values, and `update` for a preview
   * that changes a control itself (an overlay closing sets `open` back to false).
   */
  render: (props: Record<string, unknown>, update: PlaygroundUpdate) => ReactElement;
  /** Prop values the component already defaults to — used to omit defaults from the code. */
  defaultProps?: Record<string, unknown>;
  /**
   * The props with a control, in order, including `slot.prop` controls (see `slotComponents`).
   * `playground-coverage.test.ts` checks that every public prop of `component` is here or in
   * `notControlled`.
   */
  surfacedProps: string[];
  /**
   * The allowlist of public props that genuinely can't have a control, each with its reason
   * (a structured value such as a list of items, say, or a prop that only wires the component
   * to something outside the preview). Callbacks, refs, `children`, classes, styles, strings,
   * `aria-*`, `id`, render props and the `default*` twin of a controlled prop never need one.
   */
  notControlled?: Record<string, string>;
  /**
   * Defaults that depend on other values, for the snippet: a prop equal to one is left out
   * (Dialog's `closedBy` defaults to `"any"` for `role="dialog"`, `"closerequest"` for
   * `alertdialog`).
   */
  codeDefaults?: (values: Record<string, unknown>) => Record<string, unknown>;
  /**
   * Keeps the values a combination the types accept after a control changes, e.g. turning
   * `toggle` on moves a text button to filled, since text buttons have no toggle form.
   * Receives the new values and the name of the control that changed.
   */
  adjust?: (values: Record<string, unknown>, changed: string) => Record<string, unknown>;
  /** Initial control state (overrides defaults for the first render / shared URL default). */
  initialState?: Record<string, unknown>;
  /** OVERRIDE ONLY. Re-order/subset enum members otherwise read from the generated JSON. */
  enumOptions?: Record<string, string[]>;
  /**
   * OVERRIDE ONLY. The control for a prop whose type has no natural one: `boolean` turns an
   * icon or other slot on and off (pair it with `toggledSlots`), `string` edits a ReactNode as
   * text, `number` a numeric prop the props JSON types loosely.
   */
  controlKinds?: Record<string, ControlKind>;
  /**
   * OVERRIDE ONLY. The panel section of a control whose name puts it in the wrong one (see
   * `groupOf` in `controls-model.ts`).
   */
  groups?: Record<string, ControlGroup>;
  /**
   * The slider range of each number control. `playground.test.ts` checks every number control
   * has one, so the panel never falls back to a bare field.
   */
  numberRanges?: Record<string, NumberRange>;
  /**
   * What a control that isn't a prop does (the `componentSwitch` control), for its info.
   * A prop's own description comes from its JSDoc.
   */
  controlDescriptions?: Record<string, string>;
  /**
   * Slots driven by an on/off switch: the snippet writes `prop={jsx}` while the switch is on and
   * nothing while it's off. `render` maps the switch to the live element.
   */
  toggledSlots?: Record<string, string | ((values: Record<string, unknown>) => string)>;
  /**
   * Slots filled with a component of their own, whose props get controls too: a control named
   * `slot.prop` (`fab.iconTransition`) sets that prop on the slot's element, in the preview
   * (`render` reads it) and in the snippet (the slot's JSX is a function of the values).
   * `playground-coverage.test.ts` checks every public prop of the slot's component the same
   * way as the component's own, e.g. `{ fab: 'ToolbarFab' }`.
   */
  slotComponents?: Record<string, string>;
  /**
   * Sibling components the playground switches between with a segmented control (Progress:
   * linear or circular). `control` names the switch (listed in `surfacedProps`; not a prop),
   * and `components` maps each of its options to the component it renders, the first option
   * being `component`. The snippet writes the chosen component, and controls for props it
   * doesn't take are hidden. `playground-coverage.test.ts` checks every one's props.
   */
  componentSwitch?: { control: string; components: Record<string, string> };
  /**
   * The page's other documented components (`propsComponents`) that the playground doesn't
   * give controls, each with the reason: a part the preview composes for you, say, or one
   * whose own examples show it. `playground-coverage.test.ts` requires one for each.
   */
  notRendered?: Record<string, string>;
  /** Extra `@windmorph/react` member names imported alongside the component in the copied snippet. */
  importMembers?: string[];
  /** Non-`@windmorph/react` import lines for the copied snippet (one per entry). */
  codeImports?: string[];
  /**
   * Verbatim JSX for ReactNode-valued slots, self-contained so the snippet compiles; or a
   * function of the values that returns it, or null to leave the prop out.
   */
  codeSlots?: Record<string, string | ((values: Record<string, unknown>) => string | null)>;
  /** Verbatim children JSX emitted in the copied snippet, or a function of the control values. */
  codeChildren?: string | ((values: Record<string, unknown>) => string);
  /**
   * State the snippet's JSX reads, each name mapped to its hook call
   * (`{ open: 'useState(false)' }`), or a function of the values that returns them (see
   * `emitSnippet`).
   */
  codeState?:
    Record<string, string> | ((values: Record<string, unknown>) => Record<string, string>);
  /**
   * JSX around the snippet's element, such as an overlay's trigger (see `emitSnippet`), or a
   * function of the values that returns it.
   */
  codeWrap?:
    | { before: string; after: string }
    | ((values: Record<string, unknown>) => { before: string; after: string } | undefined);
  /** The entry the component is imported from in the snippet. @default '@windmorph/react' */
  importFrom?: '@windmorph/react' | '@windmorph/react-pro' | '@windmorph/react-pro/rich-text';
}

/** Casts a typed component to a loose one so arbitrary control values can be spread. */
export function loose<P>(component: ComponentType<P>): ComponentType<Record<string, unknown>> {
  return component as unknown as ComponentType<Record<string, unknown>>;
}

/** A no-op change handler so controlled inputs driven by the panel don't warn in preview. */
export const noop = () => {};

/** The density control's choices (0 to -3), as `enumOptions` with `controlKinds: 'number'`. */
export const DENSITY_OPTIONS = { density: ['0', '-1', '-2', '-3'] };

/** A density control's value (`"-2"`) as the number the prop takes; nothing when unset. */
export const asDensity = (value: unknown) =>
  value == null || value === '' ? undefined : (Number(value) as 0 | -1 | -2 | -3);

/**
 * The snippets' icons, as the reader's own named icon components; `emitSnippet` imports each
 * one it finds from `./icons`.
 */
export const STAR = '<StarIcon />';
export const ADD = '<AddIcon />';
export const EDIT = '<EditIcon />';
export const SEND = '<SendIcon />';

/**
 * Keeps a button's toggle form, link form and variant a combination its types accept: the
 * toggle-only props (`selected`, `selectedIcon`) turn `toggle` on, `toggle` and `href` rule
 * each other out, and `noToggleVariant` (Button's `text`) has no toggle form, so choosing it
 * turns `toggle` off and turning `toggle` on moves the variant to `fallbackVariant`.
 */
export function adjustToggleForm(
  values: Record<string, unknown>,
  changed: string,
  options: { noToggleVariant?: string; fallbackVariant?: string } = {},
): Record<string, unknown> {
  const next = { ...values };
  const { noToggleVariant, fallbackVariant } = options;
  const toggleOnly = ['selected', 'selectedIcon', 'selectedLeadingIcon'];
  const off = () => {
    next.toggle = false;
    for (const name of toggleOnly) if (name in next) next[name] = false;
  };
  if (toggleOnly.includes(changed) && next[changed] === true) next.toggle = true;
  if (changed === 'toggle' && next.toggle === false) off();
  if (changed === 'href' && typeof next.href === 'string' && next.href !== '') off();
  // A toggle's state is its selection: it has no pending state (the types say so).
  if (changed === 'pending' && next.pending === true) off();
  if (changed === 'variant' && noToggleVariant !== undefined && next.variant === noToggleVariant) {
    off();
  }
  if (next.toggle === true) {
    next.href = undefined;
    if ('pending' in next) next.pending = false;
    if (noToggleVariant !== undefined && next.variant === noToggleVariant) {
      next.variant = fallbackVariant;
    }
  }
  return next;
}
