import type { ComponentAccessibility } from './types';

export const timePicker: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves through the hour and minute selectors, the AM / PM group and the dial: one stop on the dial, on the chosen number.',
    },
    {
      keys: ['Arrow Up', 'Arrow Down'],
      action: 'Steps the hour or minute by one, wrapping at the ends.',
      where: 'In the hour and minute selectors',
    },
    {
      keys: ['Arrow Up', 'Arrow Right'],
      action:
        'Moves focus to the next number clockwise, wrapping; a 24-hour face runs on from the outer ring to the inner one. The value changes only when a number is chosen.',
      where: 'On the dial',
    },
    {
      keys: ['Arrow Down', 'Arrow Left'],
      action: 'Moves focus to the previous number, anticlockwise, wrapping.',
      where: 'On the dial',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Chooses the focused number. Choosing an hour switches the dial to minutes and moves focus to the nearest minute.',
      where: 'On the dial',
    },
    {
      keys: ['Arrow Up', 'Arrow Down', 'Arrow Left', 'Arrow Right'],
      action: 'Switches between AM and PM, moving focus with the choice.',
      where: 'In the AM / PM group',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Switches between the dial and the typed input.',
      where: 'On `TimePickerModeToggle`',
    },
  ],
  keyboardNotes: [
    'The selectors take typed digits: focusing one selects its text and shows its face on the dial. In input mode a complete hour moves focus on to the minute.',
    'The time reads hour, minute, then AM / PM left to right in right-to-left layouts too, as Compose does. The AM / PM group keeps the locale direction, so its left and right arrows are mirrored there.',
    'Pressing or dragging the dial picks the nearest hour (the inner ring within 74px of the centre, on a 24-hour clock) or five minutes; the keys and typing reach any minute.',
  ],
  screenReader: {
    role: 'The hour and minute are text inputs (`inputMode="numeric"`). AM / PM is a `radiogroup` of two `radio`s. The dial is a `group` of numbers, each a `button`. `TimePickerModeToggle` is an icon button.',
    name: 'The inputs are named `strings.hour` ("Hour") and `strings.minute` ("Minute"), the AM / PM group `strings.period` ("AM or PM"), and the dial `strings.dial` ("Clock"). Each number is named by `strings.dialValue` ("7 hours of 12", "35 minutes of 60"). The toggle is named `strings.inputMode` ("Toggle input picker") in dial mode and `strings.dialMode` ("Toggle dial picker") in input mode.',
    states:
      'The chosen number is pressed (`aria-pressed`). AM and PM are checked or not (`aria-checked`). A typed value out of range marks its input `aria-invalid`.',
    notes: [
      'The ":" between hour and minute, the face fading out, the numbers drawn again under the handle and the input mode\'s visible labels are hidden from assistive tech (`aria-hidden`).',
      'A screen reader activating a dial number (a click with no pointer behind it) chooses it, as Enter does.',
    ],
  },
  focus: [
    'The dial is one Tab stop with a roving `tabIndex`: on the chosen number, or for other minutes the nearest five.',
    "The dial selectors and the focused dial number show M3's focus indicator on keyboard focus only: a 3px `secondary` ring, drawn around the number's 48px circle on the dial. AM / PM options draw it inside the option.",
    'In input mode a focused field shows a 2px `primary` border on a `primary-container` fill, for pointer and keyboard focus alike.',
    'In a {@link PickerDialog}, focus is contained in the dialog and returned to what opened it on close.',
  ],
  touchTarget: [
    'Each number on the dial is a 48 × 48px circle. The hour and minute selectors are 96 × 80px (114px wide on a 24-hour clock), and the input fields 96 × 72px.',
    'The AM / PM options are drawn smaller than 48px tall (52 × 40px each in the vertical layout, 52 × 36px in the input mode, 108 × 38px in the horizontal one), but each takes 48px-tall presses: in the vertical layouts AM reaches up and PM down, away from each other, and in the horizontal one each reaches 5px above and below. Nothing in the picker sits in that space.',
    "`TimePickerModeToggle` is an icon button with a 48 × 48px target. It isn't rendered when the window has no room for the dial, where an `auto` picker shows only the typed input.",
  ],
  motion: [
    'Under reduced motion the hand jumps to a new value instead of turning on a spring. A drag moves it directly either way.',
    'The hour and minute faces still crossfade.',
  ],
  consumer: [
    'Give `TimePickerModeToggle` the same `strings` as the picker, so the toggle and the picker use one set of words.',
    'Offer the mode toggle wherever the dial shows, so the time can always be typed.',
    'Name the {@link PickerDialog} for what the time is for, with a visible `title` or `aria-label`.',
  ],
};
