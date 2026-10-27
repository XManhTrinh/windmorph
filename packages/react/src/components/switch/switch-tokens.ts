import { color, defineComponentTokens } from '../../tokens/component';

/*
 * The switch's component tokens, M3's `md.comp.switch.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with Compose's SwitchTokens defaults. The
 * switch's root and the drawn thumb (`switch-thumb.tsx`, which list items that are switches
 * draw too) carry `data-tokens`. Hover, focus, pressed and disabled values stay classes.
 */

/** The tokens of {@link Switch}: `--md-comp-switch-<part>`. */
export const switchTokenSet = defineComponentTokens({
  name: 'md-comp-switch',
  tokens: {
    'selected-track-color': {
      value: color('primary'),
      description: 'The track of a switch that is on, and its edge.',
      compose: 'SwitchTokens.SelectedTrackColor',
      paints: { property: 'background-color', slot: 'track', state: 'checked' },
    },
    'selected-handle-color': {
      value: color('on-primary'),
      description: 'The handle of a switch that is on.',
      compose: 'SwitchTokens.SelectedHandleColor',
      paints: { property: 'background-color', slot: 'thumb', state: 'checked' },
    },
    'selected-icon-color': {
      value: color('on-primary-container'),
      description: 'The icon in the handle of a switch that is on.',
      compose: 'SwitchTokens.SelectedIconColor',
      paints: { property: 'color', slot: 'thumb', state: 'checked' },
    },
    'unselected-track-color': {
      value: color('surface-container-highest'),
      description: 'The track of a switch that is off.',
      compose: 'SwitchTokens.UnselectedTrackColor',
      paints: { property: 'background-color', slot: 'track' },
    },
    'unselected-track-outline-color': {
      value: color('outline'),
      description: 'The 2px edge of the track of a switch that is off.',
      compose: 'SwitchTokens.UnselectedTrackOutlineColor',
      paints: { property: 'border-top-color', slot: 'track' },
    },
    'unselected-handle-color': {
      value: color('outline'),
      description: 'The handle of a switch that is off.',
      compose: 'SwitchTokens.UnselectedHandleColor',
      paints: { property: 'background-color', slot: 'thumb' },
    },
    'unselected-icon-color': {
      value: color('surface-container-highest'),
      description: 'The icon in the handle of a switch that is off.',
      compose: 'SwitchTokens.UnselectedIconColor',
      paints: { property: 'color', slot: 'thumb' },
    },
  },
});
