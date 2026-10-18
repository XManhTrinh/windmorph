import { color, defineComponentTokens } from '../../tokens/component';

/*
 * The slider's component tokens, M3's `md.comp.slider.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with Compose's SliderTokens defaults. One set
 * for every size and both orientations. Disabled values, the stop indicators on the active
 * track and the inset icons stay classes.
 */

/** The tokens of {@link Slider} and {@link RangeSlider}: `--md-comp-slider-<part>`. */
export const sliderTokenSet = defineComponentTokens({
  name: 'md-comp-slider',
  tokens: {
    'active-track-color': {
      value: color('primary'),
      description: 'The track between the start (or the other thumb) and the handle.',
      compose: 'SliderTokens.ActiveTrackColor',
      paints: { property: 'background-color', slot: 'active-track' },
    },
    'inactive-track-color': {
      value: color('secondary-container'),
      description: 'The rest of the track.',
      compose: 'SliderTokens.InactiveTrackColor',
      paints: { property: 'background-color', slot: 'inactive-track' },
    },
    'handle-color': {
      value: color('primary'),
      description: 'The handle.',
      compose: 'SliderTokens.HandleColor',
      paints: { property: 'background-color', slot: 'handle' },
    },
    'stop-indicator-color': {
      value: color('on-secondary-container'),
      description: 'The stop indicators and tick marks on the inactive track.',
      compose: 'SliderTokens.StopIndicatorColor',
      paints: { property: 'background-color', slot: 'stop-indicator' },
    },
    'value-indicator-container-color': {
      value: color('inverse-surface'),
      description: 'The value indicator’s container.',
      compose: 'SliderTokens.ValueIndicatorContainerColor',
      paints: { property: 'background-color', slot: 'value-indicator' },
    },
    'value-indicator-label-label-text-color': {
      value: color('inverse-on-surface'),
      description: 'The value indicator’s text.',
      compose: 'SliderTokens.ValueIndicatorLabelTextColor',
      paints: { property: 'color', slot: 'value-indicator' },
    },
  },
});
