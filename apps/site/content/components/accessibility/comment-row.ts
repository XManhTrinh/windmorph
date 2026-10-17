import type { ComponentAccessibility } from './types';

export const commentRow: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to a pressable bubble, then to the actions in the actions row. A static bubble is skipped.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Presses a bubble with `onPress`.',
      where: 'With `onPress`',
    },
    {
      keys: ['Enter'],
      action: 'Follows a bubble with `href`.',
      where: 'With `href`',
    },
  ],
  keyboardNotes: [
    'The actions in the actions row are your own components and keep their own keys.',
  ],
  screenReader: {
    role: 'The root is a `div`, an `article` or an `li` (`as`). A pressable bubble is a `button` with `onPress`, or a `link` with `href`; otherwise it is plain content.',
    name: 'An `article` takes its name from `aria-label` ("Comment by Ada"). A pressable bubble is named by its content: the name line and the words.',
    states: 'Busy (`aria-busy`) while `pending`.',
    notes: [
      'The avatar is read as whatever you pass. Pass it decorative, since the name is in the bubble.',
    ],
  },
  focus: [
    "A pressable bubble is in the Tab order and shows M3's focus indicator on keyboard focus: a 3px `secondary` outline 2px outside the bubble. Pointer presses show no ring.",
  ],
  touchTarget: [
    'A pressable bubble is as large as its content plus 8px above and below and 12px at the sides; it has no added touch target.',
    'The actions row is at least 48px tall (`actions-height`), room for actions with 48px targets.',
  ],
  motion: [
    "The filled bubble fades between its pending colour (`surface-container`) and its sent colour on the effects spring; a colour fade isn't movement, so it still fades under reduced motion. A pressable bubble's hover and focus state layers fade too, and under reduced motion its press ripple appears at full size without growing.",
  ],
  consumer: [
    'With `as="article"`, give each row an `aria-label` such as "Comment by Alex". Use `as="li"` inside a list.',
    'Pass the avatar decorative (no name of its own), since the name is in the bubble.',
    "Don't put buttons or links inside a pressable bubble: put actions in `actions`.",
    'Give every action in the row a visible label or an accessible name, and a touch target of 48px.',
    'In forced-colours mode the bubble keeps a border; keep `classNames` overrides from removing it.',
  ],
};
