import type { ComponentAccessibility } from './types';

export const progress: ComponentAccessibility = {
  keyboard: {
    none: 'A progress indicator reports progress and takes no input, so it has no keyboard interaction.',
  },
  screenReader: {
    role: '`progressbar`, from React Aria, on both the linear and the circular indicator.',
    name: '`aria-label` or `aria-labelledby`, which the types require.',
    states:
      'A determinate indicator exposes its value from 0 to 1 (`aria-valuenow`) and reads it as a percentage (`aria-valuetext`, "25%"). An indeterminate one has no value and announces that work is in progress.',
    notes: ['The animated SVG drawing is hidden from assistive tech (`aria-hidden`).'],
  },
  focus: { none: 'A progress indicator is not focusable.' },
  touchTarget: { none: 'A progress indicator takes no presses, so it has no touch target.' },
  motion: [
    'Under reduced motion the wave of a wavy indicator stops travelling, and changes of amplitude and value snap instead of easing; a value that arrives on an indeterminate indicator replaces the moving lines at once.',
    'Indeterminate motion stays, because it conveys that work is going on.',
  ],
  consumer: [
    'Name every indicator with what is loading and where: "Loading news article" or "Refreshing page", not just "Loading".',
    "Inside a button, remove the track (`track={false}`) and colour the indicator like the button's label (`classNames={{ indicator: 'stroke-current' }}`), so it keeps a 3:1 contrast against the button.",
    'Keep the linear stop dot (`stopIndicator`) unless the track has at least a 3:1 contrast with what surrounds it, so the end of the track stays easy to see.',
  ],
};
