import { color, defineComponentTokens } from '../../tokens/component';

/*
 * The progress indicators' component tokens, M3's `md.comp.progress-indicator.*` names
 * (checked against m3.material.io's token tables, 2026-10-14), with Compose's
 * ProgressIndicatorTokens defaults. Linear and circular indicators share them (each root
 * carries `data-tokens="md-comp-progress-indicator"`); `progress-styles.ts` reads one
 * private variable per part. Thickness, the gap and the wave stay props and classes.
 */

/** The tokens of the progress indicators: `--md-comp-progress-indicator-<part>`. */
export const progressIndicatorTokenSet = defineComponentTokens({
  name: 'md-comp-progress-indicator',
  tokens: {
    'active-indicator-color': {
      value: color('primary'),
      description: 'The active indicator: the line or arc that shows progress.',
      compose: 'ProgressIndicatorTokens.ActiveIndicatorColor',
      paints: { property: 'stroke', slot: 'indicator' },
    },
    'track-color': {
      value: color('secondary-container'),
      description: 'The track behind the active indicator.',
      compose: 'ProgressIndicatorTokens.TrackColor',
      paints: { property: 'stroke', slot: 'track' },
    },
    'stop-indicator-color': {
      value: color('primary'),
      description: "The stop dot at the end of a determinate linear indicator's track.",
      compose: 'ProgressIndicatorTokens.StopIndicatorColor',
      paints: { property: 'fill', slot: 'stop' },
    },
  },
});
