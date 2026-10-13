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
