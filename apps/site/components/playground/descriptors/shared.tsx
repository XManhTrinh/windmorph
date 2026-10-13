import type { ComponentType, ReactElement } from 'react';
import type { ControlKind } from '../controls-model';

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
   * The props with a control, in order. `playground-coverage.test.ts` checks that every
   * public prop of `component` is here or in `notControlled`.
   */
  surfacedProps: string[];
  /**
   * The allowlist of public props that genuinely can't have a control, each with its reason
   * (a structured value such as a list of items, say, or a prop that only wires the component
   * to something outside the preview). Callbacks, refs, `children`, classes, styles, strings,
   * `aria-*`, `id`, render props and the `default*` twin of a controlled prop never need one.
   */
  notControlled?: Record<string, string>;
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
   * Slots driven by an on/off switch: the snippet writes `prop={jsx}` while the switch is on and
   * nothing while it's off. `render` maps the switch to the live element.
   */
  toggledSlots?: Record<string, string>;
  /** Extra `@windmorph/react` member names imported alongside the component in the copied snippet. */
  importMembers?: string[];
  /** Non-`@windmorph/react` import lines for the copied snippet (one per entry). */
  codeImports?: string[];
  /** Verbatim JSX for ReactNode-valued slots, self-contained so the snippet compiles. */
  codeSlots?: Record<string, string>;
  /** Verbatim children JSX emitted in the copied snippet, or a function of the control values. */
  codeChildren?: string | ((values: Record<string, unknown>) => string);
  /** JSX around the snippet's element, such as an overlay's trigger (see `emitSnippet`). */
  codeWrap?: { before: string; after: string };
  /** The entry the component is imported from in the snippet. @default '@windmorph/react' */
  importFrom?: '@windmorph/react' | '@windmorph/react-pro' | '@windmorph/react-pro/rich-text';
}

/** Casts a typed component to a loose one so arbitrary control values can be spread. */
export function loose<P>(component: ComponentType<P>): ComponentType<Record<string, unknown>> {
  return component as unknown as ComponentType<Record<string, unknown>>;
}

/** A no-op change handler so controlled inputs driven by the panel don't warn in preview. */
export const noop = () => {};

/** Self-contained inline SVGs for the copied snippets (no icon package in this repo). */
export const svg = (path: string) =>
  `<svg viewBox="0 -960 960 960" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="${path}" /></svg>`;
export const STAR = svg(
  'm233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z',
);
export const ADD = svg('M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z');
export const EDIT = svg(
  'M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Z',
);
export const SEND = svg(
  'M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Z',
);
