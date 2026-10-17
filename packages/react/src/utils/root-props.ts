import type { AriaAttributes, DOMAttributes, HTMLAttributes } from 'react';

/** The naming attributes React Aria puts on the element it labels (a field's input, a tablist). */
type Labelling =
  'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-details' | 'aria-errormessage';

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
const GLOBAL = /^(?:title|lang|dir|hidden|inert|translate|draggable)$/;

/**
 * The DOM attributes a component passes to its root when its other props go to a React Aria
 * hook (2026-10-17): `data-*`, `aria-*` but the naming ones, global attributes and
 * {@link RootEvent}s. The naming attributes, focus, key and input events (which would fire twice
 * as they bubble from the element the hook manages) and React Aria's callbacks stay with the hook.
 */
export type RootDOMProps<E extends Element = HTMLDivElement> = Pick<
  DOMAttributes<E>,
  Extract<keyof DOMAttributes<E>, RootEvent | `${RootEvent}Capture`>
> &
  Omit<AriaAttributes, Labelling> &
  Pick<HTMLAttributes<E>, Global>;

/**
 * Splits a component's {@link RootDOMProps} (and every `data-*` attribute) from the props for its
 * React Aria hook, for a component whose hook forwards only the attributes it knows. Spread
 * `root` on the root element (merging its handlers with the hook's, React Aria's `mergeProps`)
 * and pass `rest` to the hook. A component whose hook labels the root itself (a radio group, a
 * slider's group) merges both there.
 *
 * @example
 * const { root, rest } = splitRootProps(props);
 * const { labelProps, inputProps } = useTextField(rest, inputRef);
 * return <div {...root}>…</div>;
 */
export function splitRootProps<T extends object>(
  props: T,
): {
  /** `data-*`, `aria-*` but the naming ones, global attributes and root events. */
  root: Record<string, unknown>;
  /** Everything else, for the hook. */
  rest: Omit<T, keyof RootDOMProps | `data-${string}`>;
} {
  const root: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    const toRoot =
      key.startsWith('data-') ||
      (key.startsWith('aria-') && !LABELLING.test(key)) ||
      GLOBAL.test(key) ||
      ROOT_EVENT.test(key);
    if (toRoot) root[key] = value;
    else rest[key] = value;
  }
  return { root, rest: rest as Omit<T, keyof RootDOMProps | `data-${string}`> };
}
