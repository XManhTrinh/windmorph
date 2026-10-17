/** Consumer layout classes for the layout-safety matrix (architecture §10). */
export const LAYOUT_OVERRIDES = {
  none: '',
  fixed: 'fixed right-4 bottom-4',
  absolute: 'absolute top-24 left-24',
  sticky: 'sticky top-0',
  static: 'static',
  overflowHidden: 'overflow-hidden',
  overflowVisible: 'overflow-visible',
  fullWidth: 'w-full',
  transform: 'translate-x-4 rotate-3',
} as const;

export type LayoutOverrideName = keyof typeof LAYOUT_OVERRIDES;
export const LAYOUT_OVERRIDE_NAMES = Object.keys(LAYOUT_OVERRIDES) as LayoutOverrideName[];
