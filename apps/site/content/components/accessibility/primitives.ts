import type { ComponentAccessibility } from './types';

export const primitives: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action:
        'Presses a `ButtonBase` button, including the `div` form (`elementType="div"`, `role="button"`), or switches a toggle.',
      where: '`ButtonBase`',
    },
    {
      keys: ['Enter'],
      action: 'Follows a `ButtonBase` link (`href`).',
      where: '`ButtonBase`',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        "Presses the element through React Aria's `usePress`, and starts the ripple from the centre, unless you pass `isPressed` from another hook, which then handles the keys.",
      where: '`useM3Interaction`',
    },
  ],
  keyboardNotes: [
    "`DomDirectionLocale` gives React Aria the element's laid-out direction (the same locale with only its script changed), so arrow keys follow an RTL layout while dates and numbers keep the app's language.",
  ],
  screenReader: {
    role: '`ButtonBase` is a `button`, a `link` with `href`, or a `div` with `role="button"`. `useM3Interaction` adds no role: it is presentation only. `ErrorText` has the `alert` role, and `FieldErrorIcon` the `img` role.',
    name: '`ButtonBase` takes its name from its content or your `aria-label`. `FieldErrorIcon` is named by its required `label` ("Error" in M3). `CharacterCounter` is read as its `label`, and hidden from assistive tech without one.',
    states:
      '`ButtonBase` announces disabled, and pressed or not pressed for a toggle (`aria-pressed`). An overlay trigger hands it `aria-haspopup`, `aria-expanded` and `aria-controls` through `TriggerContext`.',
    notes: [
      '`TouchTarget` is hidden from assistive tech (`aria-hidden`).',
      '`ErrorText` is announced as it appears, because of its `alert` role; pass another `role` to change that.',
      '`Overlay` portals its content to `document.body`, keeping the theme and `dir` of where it was rendered. Pass `topLayer` for content that must stay reachable above a modal, as tooltips do.',
    ],
  },
  focus: [
    '`useM3Interaction` sets `data-focus-visible` on keyboard focus, not pointer focus. The `focus-ring` utility draws a 3px `secondary` outline 2px outside the element from it, and `focus-ring-inset` the same ring inside, for full-bleed rows.',
    'A disabled `ButtonBase` cannot be focused. `preventFocusOnPress` keeps focus where it is on press, as menu triggers do.',
    '`Overlay` restores focus to where it was when its content unmounts, unless `disableFocusManagement`. Containment comes from the React Aria hook of the component using it, and is released while it animates out (`exiting`, from the `isExiting` that `usePresence` returns).',
  ],
  touchTarget: [
    "`TouchTarget` adds an invisible hit area 48px tall and at least 48px wide (the element's width if wider), centred on the control, without changing its layout. Render it inside the control's `relative` content wrapper, never on the root.",
  ],
  motion: [
    'The `state-layer` ripple appears at full size without growing under reduced motion. `container-motion` snaps corner morphs, while colours and elevation still fade.',
    'Under reduced motion the spatial spring tokens (`--md-sys-motion-spring-spatial-*-duration`, and so the `duration-m3-spatial-*` utilities) are 0ms, so anything that moves, resizes, reshapes or turns on them changes at once; the effects springs keep their durations, so fades and colour changes still run.',
    '`useM3Spring` returns the `standard` scheme, which never visibly overshoots, under reduced motion; skip spatial animations yourself, as the components do. The `motion-standard:` variant applies under the standard scheme (`data-motion="standard"`) or reduced motion.',
    '`usePresence` takes several end properties, so an exit that slides normally and fades under reduced motion can end on either. `useM3Morph` leaves reduced motion to you: snap its `progress` instead of springing it.',
  ],
  consumer: [
    'A control built on `useM3Interaction` owns its semantics: pair it with the matching React Aria hook for its role, accessible name and state.',
    'Use `focus-ring` (or `focus-ring-inset`) on every focusable element you build, and `TouchTarget` on any control smaller than 48px.',
    'Name icon-only `ButtonBase` controls with `aria-label`, and wrap a component whose arrow keys must follow the layout in `DomDirectionLocale`.',
  ],
};
