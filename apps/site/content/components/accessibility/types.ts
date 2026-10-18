/**
 * A component page's Accessibility tab as data: the same six sections on every page, so a
 * reader finds the keyboard, the screen reader, focus, the touch target, motion and their own
 * part in the same place each time. Every text is one paragraph of inline Markdown (code
 * spans, links, emphasis; see `lib/inline-markdown.ts`).
 */

/** A section that doesn't apply to the component, with the reason it doesn't. */
export interface NotApplicable {
  /** Why the section has nothing to say, as a full sentence ("It has no interactive parts."). */
  none: string;
}

/** One row of the Keyboard table: the keys and what they do. */
export interface KeyBinding {
  /**
   * The keys, each pressed on its own (`['Enter', 'Space']`); a chord is one entry
   * (`'Shift + Tab'`). Arrow keys are written `Arrow Down`, and so on.
   */
  keys: readonly string[];
  /** What the keys do, as a sentence. */
  action: string;
  /** Where the keys apply when the page documents several parts ("In the menu"). */
  where?: string;
}

/** What a screen reader meets. */
export interface ScreenReaderInfo {
  /** The element or ARIA role it exposes (`button`, `dialog`, `slider`). */
  role: string;
  /** Where its accessible name comes from. */
  name: string;
  /** The states and properties it announces (pressed, expanded, selected, value…). */
  states: string;
  /** Anything else it announces or hides (live regions, decorative icons). */
  notes?: readonly string[];
}

/** A list of sentences, or why the section doesn't apply. */
export type Notes = readonly string[] | NotApplicable;

/** Everything the Accessibility tab shows for one component page. */
export interface ComponentAccessibility {
  /** The keys it responds to. */
  keyboard: readonly KeyBinding[] | NotApplicable;
  /** Notes under the Keyboard table (focus wrapping, typeahead, RTL). */
  keyboardNotes?: readonly string[];
  screenReader: ScreenReaderInfo | NotApplicable;
  /** Focus order, the visible ring, and initial and return focus where they apply. */
  focus: Notes;
  /** Its touch target, against M3's 48 × 48px minimum. */
  touchTarget: Notes;
  /** What changes under reduced motion. */
  motion: Notes;
  /** What the consumer has to do: names to pass, labels to keep, combinations to avoid. */
  consumer: Notes;
}

/** Whether a section doesn't apply. */
export function isNotApplicable(value: unknown): value is NotApplicable {
  return typeof value === 'object' && value !== null && 'none' in value;
}

/** The sections, in display order, with their headings and anchors. */
export const ACCESSIBILITY_SECTIONS = [
  { key: 'keyboard', id: 'keyboard', title: 'Keyboard' },
  { key: 'screenReader', id: 'screen-reader', title: 'Screen reader' },
  { key: 'focus', id: 'focus', title: 'Focus' },
  { key: 'touchTarget', id: 'touch-target', title: 'Touch target' },
  { key: 'motion', id: 'motion', title: 'Motion' },
  { key: 'consumer', id: 'what-you-need-to-do', title: 'What you need to do' },
] as const satisfies readonly {
  key: keyof ComponentAccessibility;
  id: string;
  title: string;
}[];
