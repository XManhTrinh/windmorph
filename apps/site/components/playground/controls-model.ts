import type { PropsRecord } from '../../lib/component-props';

/** The kind of control inferred for a surfaced prop. */
export type ControlKind = 'enum' | 'boolean' | 'string' | 'number';

/**
 * The panel's sections, in order: how it looks, what it shows, how it behaves, and the rest
 * (folded), such as forced states, entrance replays and accessibility-only names.
 */
export const CONTROL_GROUPS = ['appearance', 'content', 'behaviour', 'advanced'] as const;
export type ControlGroup = (typeof CONTROL_GROUPS)[number];

/** Each section's heading. */
export const CONTROL_GROUP_LABELS: Record<ControlGroup, string> = {
  appearance: 'Appearance',
  content: 'Content',
  behaviour: 'Behaviour',
  advanced: 'Advanced',
};

/** A number control's slider: its range and step. */
export interface NumberRange {
  min: number;
  max: number;
  /** @default 1 */
  step?: number;
}

export interface ControlDef {
  /** The prop name this control drives. */
  name: string;
  kind: ControlKind;
  /** Human label (defaults to the prop name). */
  label: string;
  /** Enum members, for the segmented control. */
  options?: string[];
  /**
   * A choice of numbers (`controlKinds: 'number'` with `enumOptions`, e.g. an hour cycle of
   * 12 or 24): the segmented control's value is the number, so the snippet writes `{12}`.
   */
  numeric?: boolean;
  /** The panel section it sits in (see {@link groupOf}). @default 'behaviour' */
  group?: ControlGroup;
  /** The prop's JSDoc description, from the generated props, for the control's info. */
  description?: string;
  /** The component whose API lists the prop, for its anchor (`prop-<component>-<prop>`). */
  docsComponent?: string;
  /** The prop's name in that component's API (`color` for a `fab.color` control). */
  docsProp?: string;
  /** For a number: the slider's range. Without one, a number gets a compact field. */
  range?: NumberRange;
  /** For a number with a range: where the slider rests while the prop is unset (its default). */
  rest?: number;
}

/**
 * Infers the controls to render for a component from its generated props JSON, filtered and
 * ordered by the descriptor's `surfacedProps`. Enum members come from the JSON `options`
 * (emitted by `generate-props`) unless an `enumOptions` override re-orders/subsets them.
 * A prop missing from the JSON (one inherited from React Aria, say) takes its kind from its
 * default value, so a `false` default still gets a switch. A `controlKinds` override wins, for
 * a slot switched on and off or a ReactNode edited as text.
 */
export function inferControls(
  props: PropsRecord[],
  surfacedProps: string[],
  enumOptions?: Record<string, string[]>,
  defaultProps?: Record<string, unknown>,
  controlKinds?: Record<string, ControlKind>,
): ControlDef[] {
  const byName = new Map(props.map((prop) => [prop.name, prop]));
  return surfacedProps.map((name) => {
    const record = byName.get(name);
    const override = controlKinds?.[name];
    // A number with listed options is a choice of numbers.
    const numeric = override === 'number' && Boolean(enumOptions?.[name]?.length);
    const options =
      override && override !== 'enum' && !numeric
        ? undefined
        : (enumOptions?.[name] ?? record?.options);
    let kind: ControlKind;
    if (override && override !== 'enum' && !numeric) kind = override;
    else if (options && options.length > 0) kind = 'enum';
    else if (record ? record.type === 'boolean' : typeof defaultProps?.[name] === 'boolean')
      kind = 'boolean';
    else if (record ? record.type === 'number' : typeof defaultProps?.[name] === 'number')
      kind = 'number';
    else kind = 'string';
    return {
      name,
      kind,
      label: name,
      ...(options ? { options } : {}),
      ...(numeric && { numeric: true }),
    };
  });
}

/**
 * Whether a control applies to the component on show, for a playground that switches between
 * sibling components (`componentSwitch`): the switch itself, the shown component's props and
 * controls that aren't any sibling's prop apply; a sibling's own prop, and its slot's
 * `slot.prop` controls, don't.
 */
export function controlApplies(
  switcher: { control: string; components: Record<string, string> } | undefined,
  componentProps: Record<string, PropsRecord[]>,
  active: string,
): (name: string) => boolean {
  if (!switcher) return () => true;
  const own = new Set((componentProps[active] ?? []).map((prop) => prop.name));
  const siblings = new Set(
    Object.values(switcher.components).flatMap((name) =>
      (componentProps[name] ?? []).map((prop) => prop.name),
    ),
  );
  // A slot's `slot.prop` control follows its slot (`fab.tooltip` hides with `fab`).
  return (name) => {
    const base = name.split('.')[0]!;
    return base === switcher.control || own.has(base) || !siblings.has(base);
  };
}

/**
 * The props records a switching playground's controls read: `first`'s, then each sibling's
 * props it lacks, then the switch itself as a segmented control. With `unionOptions`, a prop
 * the siblings share lists every sibling's options (the URL can hold any of them).
 */
export function switchRecords(
  switcher: { control: string; components: Record<string, string> } | undefined,
  componentProps: Record<string, PropsRecord[]>,
  first: string,
  unionOptions: boolean,
): PropsRecord[] {
  const byName = new Map<string, PropsRecord>();
  for (const name of [first, ...Object.values(switcher?.components ?? {})]) {
    for (const record of componentProps[name] ?? []) {
      const seen = byName.get(record.name);
      if (!seen) byName.set(record.name, record);
      else if (unionOptions && seen.options && record.options) {
        byName.set(record.name, {
          ...seen,
          options: [...new Set([...seen.options, ...record.options])],
        });
      }
    }
  }
  if (switcher) {
    byName.set(switcher.control, {
      name: switcher.control,
      type: 'enum',
      required: true,
      options: Object.keys(switcher.components),
    });
  }
  return [...byName.values()];
}

/** Booleans that switch a slot or a decoration on and off, by name: Content. */
const CONTENT_NAME =
  /(?:Icon|Icons)$|^(?:icons?|label|title|subtitle|placeholder|description|supportingText|errorMessage|prefix|suffix|badge|bubble|name|initials|actionLabel|menu|leading|trailing|actions|header|bottom|toolbar|tools|attachments|send|fab|src|banner|emptyAction|mentions|below|total|maxIcons|max|length|lines|country|locale|priorityCountries|items|tooltip)$/;

/** Props that only make sense for testing or wiring, or that only name things for assistive tech. */
const ADVANCED_NAME =
  /^(?:dragged|appear|autoFocus|focusOnMount|announce|swipeable|instant|clearOnSubmit|expandOnFocus|defaultOpen|rootMargin|stickyTop|listWidth|detailKey|offset|containerPadding|as|titleAs|listAs|elementType|preventFocusOnPress|decorative|supportingTextOnFocus|defaultSearchValue|resultsAnnouncement|menuLabel|prefixLabel|suffixLabel|badgeLabel|listLabel|detailLabel|leadingLabel|fullLabel)$/;

/** Booleans and numbers that change only how it looks: Appearance. */
const APPEARANCE_NAME =
  /^(?:show[A-Z]\w*|valueLabel|modeToggle|counter|lineNumbers|idleIcon|elevated|wavy|ticks|caret|track|stopIndicator|centered|divider|dividers|ring|dot|shapes|selectionIndicator|docked|multiline|autoGrow|thickness|trackThickness|size|expandedRatio|columns|rows|maxRows|minRows|headlineLines|supportingTextLines|peekHeight|preferredItemSize|itemSize|itemSpacing|minSmallItemSize|maxSmallItemSize|maxWidth|fullScreen|mask|iconTransition|indicatorMotion)$/;

/** Choices that change how it works rather than how it looks: Behaviour. */
const BEHAVIOUR_ENUM =
  /^(?:selectionMode|value|defaultOption|submitOn|keyboardActivation|scrollBehavior|snap|mode|defaultMode|defaultDetent|closedBy|hourCycle|type|capture|status|active|toolsWhenIdle|role|presentation|exitEdge)$/;

/**
 * The section a control sits in, from its name and kind, unless the descriptor's `groups`
 * says otherwise. A slot switched on and off and any text are Content; forced states, entrance
 * replays and accessibility-only names are Advanced; style choices are Appearance; the rest
 * (states, selection, opening) is Behaviour. `slot.prop` controls follow their prop's name.
 */
export function groupOf(name: string, kind: ControlKind, slotToggle = false): ControlGroup {
  const base = name.includes('.') ? name.slice(name.indexOf('.') + 1) : name;
  if (ADVANCED_NAME.test(base)) return 'advanced';
  if (slotToggle) return 'content';
  if (base === 'href') return 'behaviour';
  if (kind === 'enum') return BEHAVIOUR_ENUM.test(base) ? 'behaviour' : 'appearance';
  if (APPEARANCE_NAME.test(base)) return 'appearance';
  if (kind === 'string' || CONTENT_NAME.test(base)) return 'content';
  return 'behaviour';
}

/** The controls in their sections, in section order, each keeping its own order; empty ones left out. */
export function groupControls(
  controls: readonly ControlDef[],
): { group: ControlGroup; controls: ControlDef[] }[] {
  return CONTROL_GROUPS.flatMap((group) => {
    const members = controls.filter((def) => (def.group ?? 'behaviour') === group);
    return members.length > 0 ? [{ group, controls: members }] : [];
  });
}

/**
 * Two short options fit a connected button group beside its name in the narrowest panel
 * (the control column of the panel's grid); a longer one gets a select.
 */
export function isSegmented(options: readonly string[]): boolean {
  return options.length <= 2 && options.join('').length <= 12;
}

/** Clamps a number into a control's range, snapped to its step. */
export function clampToRange(value: number, range: NumberRange): number {
  const step = range.step ?? 1;
  const snapped = Math.round((value - range.min) / step) * step + range.min;
  // Rounding a decimal step leaves float noise (0.30000000000000004).
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Math.min(range.max, Math.max(range.min, Number(snapped.toFixed(decimals))));
}
