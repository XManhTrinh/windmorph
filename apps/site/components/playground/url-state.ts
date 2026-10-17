import { clampToRange, type ControlDef } from './controls-model';

/**
 * Encodes playground state as discrete typed query keys (one per surfaced prop), e.g.
 * `?variant=outlined&disabled=true&label=Save`. Empty / undefined values are dropped so the
 * query stays minimal.
 */
export function encodeState(values: Record<string, unknown>, controls: ControlDef[]): string {
  const params = new URLSearchParams();
  for (const control of controls) {
    const value = values[control.name];
    if (value === undefined || value === null || value === '') continue;
    params.set(control.name, String(value));
  }
  return params.toString();
}

/**
 * Decodes playground state from query keys, validating each value against its control type
 * (enum membership, boolean coerce, finite number, clamped into a slider's range). Unknown
 * keys and invalid values are ignored, so a bad or older URL falls back to control defaults
 * rather than throwing. The keys are the props' own names, so grouping the panel never
 * changes a link.
 */
export function decodeState(
  params: URLSearchParams,
  controls: ControlDef[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const control of controls) {
    if (!params.has(control.name)) continue;
    const raw = params.get(control.name)!;
    switch (control.kind) {
      case 'enum':
        if (control.options?.includes(raw)) out[control.name] = control.numeric ? Number(raw) : raw;
        break;
      case 'boolean':
        if (raw === 'true' || raw === 'false') out[control.name] = raw === 'true';
        break;
      case 'number': {
        const value = Number(raw);
        // A link shared before a control had its slider keeps working, inside the range.
        if (raw.trim() !== '' && Number.isFinite(value)) {
          out[control.name] = control.range ? clampToRange(value, control.range) : value;
        }
        break;
      }
      default:
        out[control.name] = raw;
    }
  }
  return out;
}
