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
    name: '`alt`, followed by the presence word, the `badgeLabel` and the `statusRingLabel` ("Sam, online, verified, new story"), and for a link with `target="_blank"`, "opens in a new tab" (`labels.newTab`). A group is named once by its `aria-label` (or `aria-labelledby`).',
    states:
      'None beyond the name: presence, the badge and the status ring are read as part of it, not as separate states.',
    notes: [
      'The photo (`alt=""`), the initials or icon, the presence dot, the badge and the status ring are all hidden from assistive tech; the name on the root carries their meaning.',
      "On a `decorative` avatar, and on a static one in an `AvatarGroup` that isn't inside your own link or button, nothing announces the status ring: say what it means in the text beside the avatar, or in the group's label.",
      "Initials are drawn as generated content, so a link or button's visible text never differs from its name.",
      'In `AvatarGroup`, static avatars become decorative, so the group is read once (one inside your own link or button names that control instead); linked or pressable avatars keep their own names. A "+N" avatar is decorative, or named by `labels.overflow` ("3 more") when it is a link or button.',
    ],
  },
  focus: [
    'Only an avatar with `href` or `onPress` can take focus, in the Tab order where it sits in the page.',
    "Keyboard focus shows M3's focus indicator: a 3px `secondary` outline 2px outside the avatar, round for M3 Expressive shapes, plus a focus state layer, painted over the photo too. Pointer presses show no ring.",
    'On an avatar with a status ring the indicator moves out past the ring. In an `AvatarGroup`, the avatar that holds keyboard focus is drawn above the others, so no neighbour, ring or badge covers its indicator.',
  ],
  touchTarget: [
    'A linked or pressable avatar always has a touch target of at least 48 × 48px, invisible and outside its layout: `xs`, `sm` and `md` (24, 32 and 40px), a number below 48 (`size={28}`) and a size set from CSS (`--wm-avatar-size`) get one 48px square, and larger avatars are their own target. Sizes and targets are in px, so they hold at larger text sizes.',
    'When two or more avatars in an `AvatarGroup` are links or buttons (the "+N" one included), the group stops overlapping and spaces them 48px minus the avatar size apart (at least 4px), so their touch targets never overlap; a size given as a number or from CSS is spaced the same way. Decorative avatars in a group let presses through to a link they overlap.',
  ],
  motion: [
    "A link or button avatar has the core's state layer: hover and focus fade it in, and a press spreads a ripple. Under reduced motion the ripple appears at full size without growing; the static avatar has no animation.",
  ],
  consumer: [
    'Give every avatar `alt` (usually the person or business name), or mark it `decorative` when the name is written next to it. The types require one of the two, and `alt` for a link or button.',
    'Pass `labels` to translate the presence words, `badgeLabel` to say what the badge means, and `statusRingLabel` to say what a status ring means ("new story", "live"); the types require it with `statusRing`. The ring differs from its inactive form in weight as well as colour, but its meaning is in that label only.',
    "Your own link or button around an avatar with a status ring should move its focus indicator out past the ring (`outline-offset` of the ring's reach, 4px or 5px from `lg`, plus your own offset); a link or button avatar does it by itself.",
    'Give `AvatarGroup` an `aria-label` (or `aria-labelledby`) that names everyone it stands for ("Alex, Sam and 3 others"), and a `labels.overflow` in your language when "+N" is a link or button.',
    'Your own component around an Avatar in a group is fine: the group reaches it through context. Pass `alt` and `href` or `onPress` to the Avatar inside, or wrap a static Avatar (with `alt`) in your own link or button: the avatar then names that control, and it takes presses.',
  ],
};
