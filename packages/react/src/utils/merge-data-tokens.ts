/**
 * A component's own `data-tokens` set followed by the sets an app passed in
 * `props['data-tokens']`, each once (`"md-comp-assist-chip app-reaction"`). Token rules match
 * with `~=`, so the root keeps the component's styles and takes the app's.
 */
export function mergeDataTokens(own: string, props?: object | null): string {
  const incoming = (props as { 'data-tokens'?: unknown } | null | undefined)?.['data-tokens'];
  if (typeof incoming !== 'string') return own;
  return [...new Set(`${own} ${incoming}`.split(/\s+/).filter(Boolean))].join(' ');
}
