import type { PropsRecord } from '../../lib/component-props';

/** The kind of control inferred for a surfaced prop. */
export type ControlKind = 'enum' | 'boolean' | 'string' | 'number';

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
