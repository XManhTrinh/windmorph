import type { PropsRecord } from '../../lib/component-props';
import { emitSnippet, normalizeDefault, propDefaultsFrom } from './code-emit';
import {
  clampToRange,
  controlApplies,
  groupOf,
  inferControls,
  switchRecords,
  type ControlDef,
} from './controls-model';
import type { PlaygroundDescriptor } from './descriptors/shared';

/**
 * A playground's state as the page and `check-snippets` both read it: its starting values,
 * the component on show, its controls and the snippet it copies. One source, so the checked
 * snippets are exactly the ones a reader can copy.
 */

/** The props JSON records of a page's documented components, by component name. */
export type ComponentProps = Record<string, PropsRecord[]>;

/** The starting values: the switch's first option, then the defaults and the initial state. */
export function initialValues(descriptor: PlaygroundDescriptor): Record<string, unknown> {
  const switcher = descriptor.componentSwitch;
  return {
    ...(switcher && { [switcher.control]: Object.keys(switcher.components)[0] }),
    ...descriptor.defaultProps,
    ...descriptor.initialState,
  };
}

/** The component on show: the descriptor's, or the sibling its switch has chosen. */
export function activeComponent(
  descriptor: PlaygroundDescriptor,
  values: Record<string, unknown>,
): string {
  const switcher = descriptor.componentSwitch;
  return (
    (switcher && switcher.components[String(values[switcher.control])]) ?? descriptor.component
  );
}

/**
 * The controls for `active`, with its own enum options; a sibling's own props are left out.
 * With `forUrl`, every control of every sibling, with every option of a shared prop, since a
 * shared URL can hold any of them.
 */
export function playgroundControls(
  descriptor: PlaygroundDescriptor,
  componentProps: ComponentProps,
  active: string,
  forUrl = false,
): ControlDef[] {
  const switcher = descriptor.componentSwitch;
  const controls = inferControls(
    switchRecords(switcher, componentProps, forUrl ? descriptor.component : active, forUrl),
    descriptor.surfacedProps,
    descriptor.enumOptions,
    descriptor.defaultProps,
    descriptor.controlKinds,
  );
  const decorated = controls.map((def) => describeControl(descriptor, componentProps, active, def));
  if (forUrl) return decorated;
  const applies = controlApplies(switcher, componentProps, active);
  return decorated.filter((def) => applies(def.name));
}

/** The component whose API documents a control's prop, and the prop's name there. */
function docsTarget(
  descriptor: PlaygroundDescriptor,
  componentProps: ComponentProps,
  active: string,
  name: string,
): { component: string; prop: string } | undefined {
  const dot = name.indexOf('.');
  if (dot > 0) {
    const component = descriptor.slotComponents?.[name.slice(0, dot)];
    return component ? { component, prop: name.slice(dot + 1) } : undefined;
  }
  const candidates = [
    active,
    descriptor.component,
    ...Object.values(descriptor.componentSwitch?.components ?? {}),
  ];
  const component = candidates.find((candidate) =>
    (componentProps[candidate] ?? []).some((record) => record.name === name),
  );
  return component ? { component, prop: name } : undefined;
}

/**
 * A control with what the panel shows beside it: its section, its prop's description and API
 * anchor, and a number's slider range.
 */
function describeControl(
  descriptor: PlaygroundDescriptor,
  componentProps: ComponentProps,
  active: string,
  def: ControlDef,
): ControlDef {
  const { name } = def;
  const switcher = descriptor.componentSwitch;
  if (switcher && name === switcher.control) {
    return {
      ...def,
      group: descriptor.groups?.[name] ?? 'appearance',
      description:
        descriptor.controlDescriptions?.[name] ??
        `Which component the playground shows: ${Object.values(switcher.components).join(' or ')}.`,
    };
  }
  const target = docsTarget(descriptor, componentProps, active, name);
  const record = target
    ? componentProps[target.component]?.find((candidate) => candidate.name === target.prop)
    : undefined;
  // A switch for a prop that isn't a boolean turns a slot (an icon, a menu) on and off.
  const slotToggle =
    def.kind === 'boolean' &&
    (name in (descriptor.toggledSlots ?? {}) ||
      (record !== undefined && /React|Node|Element|=>/.test(record.type)));
  const description = descriptor.controlDescriptions?.[name] ?? record?.description;
  const range = descriptor.numberRanges?.[name];
  // An unset number's slider rests on the prop's documented default, when it's a number.
  const fallback = Number.parseFloat(normalizeDefault(record?.defaultValue ?? ''));
  const rest = range && Number.isFinite(fallback) ? clampToRange(fallback, range) : undefined;
  return {
    ...def,
    group: descriptor.groups?.[name] ?? groupOf(name, def.kind, slotToggle),
    ...(description && { description }),
    ...(target && { docsComponent: target.component, docsProp: target.prop }),
    ...(range && { range }),
    ...(rest !== undefined && { rest }),
  };
}

/** The copy-ready snippet for the current values and the controls on show. */
export function playgroundSnippet(
  descriptor: PlaygroundDescriptor,
  componentProps: ComponentProps,
  values: Record<string, unknown>,
  controls: readonly ControlDef[],
): string {
  const active = activeComponent(descriptor, values);
  const shown = new Set(controls.map((def) => def.name));
  return emitSnippet({
    component: active,
    values,
    surfacedProps: descriptor.surfacedProps.filter(
      (name) => name !== descriptor.componentSwitch?.control && shown.has(name),
    ),
    defaultProps: { ...descriptor.defaultProps, ...descriptor.codeDefaults?.(values) },
    propDefaults: propDefaultsFrom(componentProps[active] ?? []),
    importMembers: descriptor.importMembers,
    codeImports: descriptor.codeImports,
    codeSlots: descriptor.codeSlots,
    toggledSlots: descriptor.toggledSlots,
    codeChildren:
      typeof descriptor.codeChildren === 'function'
        ? descriptor.codeChildren(values)
        : descriptor.codeChildren,
    codeWrap: descriptor.codeWrap,
    importFrom: descriptor.importFrom,
  });
}
