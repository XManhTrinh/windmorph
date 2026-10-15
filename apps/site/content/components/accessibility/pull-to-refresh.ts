import type { ComponentAccessibility } from './types';

export const pullToRefresh: ComponentAccessibility = {
  keyboard: {
    none: 'The pull is a touch, mouse or pen gesture with no keyboard equivalent; a refresh button you provide that sets `refreshing` is the keyboard way to refresh.',
  },
  screenReader: {
    role: 'The area is a plain `div` around your content. While shown, the indicator is a {@link LoadingIndicator}: a `progressbar`.',
    name: '`labels.pull` ("Pull to refresh") while it follows a pull, and `labels.refreshing` ("Refreshing") while a refresh runs.',
    states:
      'Determinate while it follows a pull, with the pull as its value (0 to 1); indeterminate while refreshing. The face that has faded out is hidden from assistive tech (`aria-hidden`).',
    notes: [
      'A polite live region (`role="status"`) announces `labels.refreshing` when a refresh starts and `labels.refreshed` ("Refreshed") when it ends, however it was started.',
      'At rest, with no refresh running, the indicator is not rendered at all.',
    ],
  },
  focus: [
    'It adds nothing to the Tab order, and the indicator never takes focus. Focus stays wherever it was during a pull and a refresh.',
    'When the area is itself the scroll container, it needs keyboard access like any scrolling region: give it `tabIndex={0}`, `role="region"` and an `aria-label`, as the examples do.',
  ],
  touchTarget: [
    'The whole area takes the pull, so there is no small target to hit. The indicator is a 48px circle that ignores the pointer (`pointer-events: none`).',
  ],
  motion: [
    "Under reduced motion the indicator settles to the threshold or away on the standard motion scheme's spring, which doesn't overshoot, and the refreshing indicator only rotates, without morphing.",
    'While pulled, the indicator follows the gesture directly. The crossfade between the pull and refreshing indicators still runs.',
  ],
  consumer: [
    "Pull to refresh can't be the only way to refresh, because not everyone can drag. Put a refresh button in the app bar, a menu or beside the content that sets `refreshing`: the same indicator comes in and the same announcements are made. The component has no built-in button, because where it goes is part of the screen's layout.",
    'Name the labels for what refreshes (`labels={{ refreshing: "Refreshing messages" }}`).',
  ],
};
