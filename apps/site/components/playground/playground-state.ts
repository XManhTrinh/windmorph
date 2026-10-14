import type { PropsRecord } from '../../lib/component-props';
import { emitSnippet, propDefaultsFrom } from './code-emit';
import { controlApplies, inferControls, switchRecords, type ControlDef } from './controls-model';
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
  if (forUrl) return controls;
  const applies = controlApplies(switcher, componentProps, active);
  return controls.filter((def) => applies(def.name));
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
