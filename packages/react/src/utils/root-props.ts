import type { AriaAttributes, DOMAttributes, HTMLAttributes } from 'react';

/** The naming attributes React Aria puts on the element it labels (a field's input, a tablist). */
type Labelling =
  'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-details' | 'aria-errormessage';

/**
 * The attributes that describe a widget's own state and relations (2026-10-17): what it controls
 * and whether it opens a popup, its autocompletion and active descendant, whether it is
 * expanded, required, invalid or read-only, and a text box's `aria-multiline` and
 * `aria-placeholder`. They belong on the widget, never on a wrapper (ARIA doesn't allow them on
 * a generic `div` or a `label`).
 */
export type WidgetAria =
  | 'aria-controls'
  | 'aria-haspopup'
  | 'aria-autocomplete'
  | 'aria-activedescendant'
  | 'aria-expanded'
  | 'aria-required'
  | 'aria-invalid'
  | 'aria-readonly'
  | 'aria-multiline'
  | 'aria-placeholder';

/**
 * The naming and description attributes React Aria's hooks don't forward (2026-10-24): a plain
 * text description, a role description and the braille label and role description. Like the
 * naming attributes, they belong on the element React Aria labels: ARIA prohibits
 * `aria-roledescription` and the braille attributes on a generic `div`, and a description there
 * describes nothing. A component takes them in its props, as {@link RootDOMProps} does; where
 * the root wraps the labelled element, {@link splitRootProps} keeps them in `rest` and
 * {@link pickWidgetAria} hands them over.
 */
export type DescriptionAria =
  'aria-description' | 'aria-roledescription' | 'aria-braillelabel' | 'aria-brailleroledescription';

/** Events about the whole component: pointer, mouse, touch, drag, wheel, scroll, animation. */
export type RootEvent =
  | 'onClick'
  | 'onAuxClick'
  | 'onContextMenu'
  | 'onDoubleClick'
  | `onMouse${'Down' | 'Enter' | 'Leave' | 'Move' | 'Out' | 'Over' | 'Up'}`
  | `onPointer${'Down' | 'Move' | 'Up' | 'Cancel' | 'Enter' | 'Leave' | 'Over' | 'Out'}`
  | 'onGotPointerCapture'
  | 'onLostPointerCapture'
  | `onTouch${'Start' | 'Move' | 'End' | 'Cancel'}`
  | `onDrag${'' | 'End' | 'Enter' | 'Exit' | 'Leave' | 'Over' | 'Start'}`
  | 'onDrop'
  | 'onWheel'
  | 'onScroll'
  | `onAnimation${'Start' | 'End' | 'Iteration'}`
  | `onTransition${'Start' | 'Run' | 'End' | 'Cancel'}`;

/** Global HTML attributes about the whole component. */
type Global = 'title' | 'lang' | 'dir' | 'hidden' | 'inert' | 'translate' | 'draggable';

/** {@link RootEvent} and its capture form, at run time. */
const ROOT_EVENT =
  /^on(?:Click|AuxClick|ContextMenu|DoubleClick|Mouse(?:Down|Enter|Leave|Move|Out|Over|Up)|Pointer(?:Down|Move|Up|Cancel|Enter|Leave|Over|Out)|(?:Got|Lost)PointerCapture|Touch(?:Start|Move|End|Cancel)|Drag(?:End|Enter|Exit|Leave|Over|Start)?|Drop|Wheel|Scroll|Animation(?:Start|End|Iteration)|Transition(?:Start|Run|End|Cancel))(?:Capture)?$/;
const LABELLING = /^aria-(?:label|labelledby|describedby|details|errormessage)$/;
const WIDGET_ARIA =
  /^aria-(?:controls|haspopup|autocomplete|activedescendant|expanded|required|invalid|readonly|multiline|placeholder)$/;
const DESCRIPTION_ARIA =
  /^aria-(?:description|roledescription|braillelabel|brailleroledescription)$/;
const GLOBAL = /^(?:title|lang|dir|hidden|inert|translate|draggable)$/;

/**
 * The DOM attributes a component passes to its root when its other props go to a React Aria
 * hook (2026-10-17): `data-*`, `aria-*` but the naming ones, global attributes and
 * {@link RootEvent}s. The {@link DescriptionAria} attributes are among them, for a root that is
 * the labelled element; a wrapper hands them to that element instead. The naming attributes, focus, key and input events (which would fire twice
 * as they bubble from the element the hook manages) and React Aria's callbacks stay with the hook.
 */
export type RootDOMProps<E extends Element = HTMLDivElement> = Pick<
  DOMAttributes<E>,
  Extract<keyof DOMAttributes<E>, RootEvent | `${RootEvent}Capture`>
> &
  Omit<AriaAttributes, Labelling> &
  Pick<HTMLAttributes<E>, Global>;

/**
 * {@link RootDOMProps} for a component whose root wraps the element React Aria labels (a
 * field's input, a checkbox's input, a select's trigger, a tab list): without the
 * {@link WidgetAria} attributes, which describe that element. A component that lets the app set
 * them takes them in its own props and puts them on that element. The {@link DescriptionAria}
 * attributes stay in the type: they reach that element through {@link pickWidgetAria}.
 */
export type WrapperRootDOMProps<E extends Element = HTMLDivElement> = Omit<
  RootDOMProps<E>,
  WidgetAria
>;

/** Options for {@link splitRootProps}. */
export interface SplitRootPropsOptions {
  /**
   * The root wraps the element React Aria labels (see {@link WrapperRootDOMProps}), so the
   * {@link WidgetAria} and {@link DescriptionAria} attributes stay in `rest`, for that element,
   * instead of going to the root.
   * @default false
   */
  wrapper?: boolean;
}

/** What {@link splitRootProps} returns. */
export interface SplitRootProps<Rest> {
  /**
   * `data-*`, `aria-*` but the naming ones (and, for a wrapper, the {@link WidgetAria} and
   * {@link DescriptionAria} ones), global attributes and root events.
   */
  root: Record<string, unknown>;
  /**
   * Everything else, for the hook. Its type leaves out what went to `root`: for a wrapper, the
   * widget and description attributes stay in it.
   */
  rest: Rest;
}

/**
 * Splits a component's {@link RootDOMProps} (and every `data-*` attribute) from the props for its
 * React Aria hook, for a component whose hook forwards only the attributes it knows. Spread
 * `root` on the root element (merging its handlers with the hook's, React Aria's `mergeProps`)
 * and pass `rest` to the hook. A component whose hook labels the root itself (a radio group, a
 * slider's group) merges both there. One whose root wraps the labelled element passes
 * `{ wrapper: true }`, so the attributes that describe that element (`aria-controls`,
 * `aria-expanded`, `aria-invalid` …, {@link WidgetAria}, and `aria-description` …,
 * {@link DescriptionAria}) stay with it; React Aria's hooks forward only some of them, so
 * {@link pickWidgetAria} hands over the rest.
 *
 * @example
 * const { root, rest } = splitRootProps(props, { wrapper: true });
 * const { labelProps, inputProps } = useTextField(rest, inputRef);
 * return (
 *   <div {...root}>
 *     <input {...mergeProps(inputProps, pickWidgetAria(rest))} />
 *   </div>
 * );
 */
export function splitRootProps<T extends object>(
  props: T,
  options: SplitRootPropsOptions & { wrapper: true },
): SplitRootProps<Omit<T, Exclude<keyof WrapperRootDOMProps, DescriptionAria> | `data-${string}`>>;
export function splitRootProps<T extends object>(
  props: T,
  options?: SplitRootPropsOptions,
): SplitRootProps<Omit<T, keyof RootDOMProps | `data-${string}`>>;
export function splitRootProps<T extends object>(
  props: T,
  options: SplitRootPropsOptions = {},
): SplitRootProps<Partial<T>> {
  const root: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    const toRoot =
      key.startsWith('data-') ||
      (key.startsWith('aria-') &&
        !LABELLING.test(key) &&
        !(options.wrapper && (WIDGET_ARIA.test(key) || DESCRIPTION_ARIA.test(key)))) ||
      GLOBAL.test(key) ||
      ROOT_EVENT.test(key);
    if (toRoot) root[key] = value;
    else rest[key] = value;
  }
  return { root, rest: rest as Partial<T> };
}

/**
 * The {@link WidgetAria} and {@link DescriptionAria} attributes among `props`, for the element
 * React Aria labels: a hook forwards only those it knows (a text field's `aria-controls`, but not
 * its `aria-expanded` or `aria-description`), so a wrapper component merges these with the
 * hook's own props.
 */
export function pickWidgetAria(props: object): Pick<AriaAttributes, WidgetAria | DescriptionAria> {
  const picked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if ((WIDGET_ARIA.test(key) || DESCRIPTION_ARIA.test(key)) && value !== undefined) {
      picked[key] = value;
    }
  }
  return picked as Pick<AriaAttributes, WidgetAria | DescriptionAria>;
}

/**
 * The {@link DescriptionAria} attributes among `props`, for a wrapper that sets every
 * {@link WidgetAria} attribute of its labelled element itself (a select's trigger, a tab list).
 */
export function pickDescriptionAria(props: object): Pick<AriaAttributes, DescriptionAria> {
  const picked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (DESCRIPTION_ARIA.test(key) && value !== undefined) picked[key] = value;
  }
  return picked as Pick<AriaAttributes, DescriptionAria>;
}

/**
 * An `aria-invalid`, `aria-required` or `aria-readonly` value as a field's own boolean state, for
 * a field that sets these attributes itself and reads an app's (a form library's) as its
 * `invalid`, `required` or `readOnly`: `undefined` when left out, `false` for `false` or
 * `"false"`, and `true` for anything else (`aria-invalid="grammar"` too).
 */
export function ariaFlag(value: AriaAttributes['aria-invalid']): boolean | undefined {
  if (value === undefined) return undefined;
  return value !== false && value !== 'false';
}
