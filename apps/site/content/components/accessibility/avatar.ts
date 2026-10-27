import type { ComponentAccessibility } from './types';

export const avatar: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to an avatar with `href` or `onPress`, and on to the next element. A static avatar is skipped.',
    },
    { keys: ['Enter'], action: 'Follows the link.', where: 'With `href`' },
    { keys: ['Enter', 'Space'], action: 'Presses the button.', where: 'With `onPress`' },
  ],
  screenReader: {
    role: 'A static avatar is an image (`role="img"`), or hidden (`aria-hidden`) when `decorative`. With `href` it is a `link`; with `onPress`, a `button`. `AvatarGroup` is a `group`.',
    name: '`alt`, followed by the presence word and the `badgeLabel` ("Sam, online, verified"). A group is named once by its `aria-label` (or `aria-labelledby`).',
    states:
      'None beyond the name: presence and the badge are read as part of it, not as separate states.',
    notes: [
      'The photo (`alt=""`), the initials or icon, the presence dot and the badge are all hidden from assistive tech; the name on the root carries their meaning.',
      "Initials are drawn as generated content, so a link or button's visible text never differs from its name.",
      'In `AvatarGroup`, static avatars become decorative, so the group is read once; linked or pressable avatars keep their own names. A "+N" avatar is decorative, or named by `labels.overflow` ("3 more") when it is a link or button.',
    ],
  },
  focus: [
    'Only an avatar with `href` or `onPress` can take focus, in the Tab order where it sits in the page.',
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the avatar, round for M3 Expressive shapes, plus a focus state layer, painted over the photo too. Pointer presses show no ring.",
  ],
  touchTarget: [
    'Linked or pressable `xs`, `sm` and `md` avatars (24, 32 and 40px) get an invisible 48 × 48px touch target; their layout size stays the same. `lg`, `xl` and `2xl` (56, 72 and 96px) are already larger than 48px. Sizes and targets are in px, so they hold at larger text sizes.',
    'When two or more avatars in an `AvatarGroup` are links or buttons (the "+N" one included), the group stops overlapping and spaces them 48px minus the avatar size apart (at least 4px), so their touch targets never overlap. Decorative avatars in a group let presses through to a link they overlap.',
  ],
  motion: [
    "A link or button avatar has the core's state layer: hover and focus fade it in, and a press spreads a ripple. Under reduced motion the ripple appears at full size without growing; the static avatar has no animation.",
  ],
  consumer: [
    'Give every avatar `alt` (usually the person or business name), or mark it `decorative` when the name is written next to it. The types require one of the two, and `alt` for a link or button.',
    'Pass `labels` to translate the presence words, and `badgeLabel` to say what the badge means.',
    'Give `AvatarGroup` an `aria-label` (or `aria-labelledby`) that names everyone it stands for ("Alex, Sam and 3 others"), and a `labels.overflow` in your language when "+N" is a link or button.',
    'Your own component around an Avatar in a group is fine: the group reaches it through context. Pass `alt` and `href` or `onPress` to the Avatar inside, or wrap a static Avatar (with `alt`) in your own link or button: the avatar then names that control, and it takes presses.',
  ],
};
