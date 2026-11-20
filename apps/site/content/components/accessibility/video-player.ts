import type { ComponentAccessibility } from './types';

export const videoPlayer: ComponentAccessibility = {
  keyboard: [
    { keys: ['Space', 'K'], action: 'Plays or pauses; the mark says "Playing" or "Paused".' },
    { keys: ['J', 'L'], action: 'Goes back or forward 10 seconds.' },
    { keys: ['Arrow Left', 'Arrow Right'], action: 'Goes back or forward 5 seconds.' },
    { keys: ['Arrow Up', 'Arrow Down'], action: 'Turns the volume up or down 5%.' },
    { keys: ['M'], action: 'Mutes or unmutes.' },
    { keys: ['F'], action: 'Enters or leaves full screen.' },
    { keys: ['C'], action: 'Turns captions on or off, with `captions`.' },
    { keys: ['0 to 9'], action: 'Goes to that tenth of the video: 5 to its middle.' },
    { keys: ['<', '>'], action: 'Slower or faster, through `playbackRates`.' },
    { keys: ['Shift + N'], action: 'Next, with `onNext`.' },
    {
      keys: ['R', 'Shift + R'],
      action: 'Turns the picture a quarter clockwise or back, with `rotatable`.',
    },
    { keys: ['T'], action: 'Theater, when it is offered.' },
    { keys: ['Escape'], action: "Leaves full screen (the browser's own)." },
  ],
  keyboardNotes: [
    "The keys work while focus is inside the player (WCAG 2.1.4), in either case, and never with Alt, Control or Command, which stay the browser's.",
    'Space is left to a focused button, link or field; on the scrubber and the volume it plays and pauses.',
    "A key pressed in the settings, a menu or a dialog opened from the player is theirs. The scrubber's and the volume's own keys (arrows, Page Up and Page Down, Home and End) never reach the player.",
    "Each button's tooltip shows its key, and the button carries `aria-keyshortcuts`; a `VideoPlayerControl` with `shortcut` shows and binds its own.",
  ],
  screenReader: {
    role: 'A `group` with `aria-roledescription` "Video player". Every control is a button; the scrubber ("Seek") and the volume ("Volume") are sliders.',
    name: "The player takes `aria-label` or `aria-labelledby` (one is required), the video's title. Each control has a name and a tooltip (`labels`).",
    states:
      'On and off controls (Captions, Autoplay, Theater) report `aria-pressed` with a name that doesn\'t change; the tooltip says the state. Play, the sound button and full screen change their name ("Pause", "Unmute", "Exit full screen"). The scrubber is read in words, the volume as "Volume 55%". Settings reports `aria-haspopup="dialog"`, `aria-expanded` and, while open, `aria-controls`.',
    notes: [
      'What a key or a gesture did is said politely, each time, the same words twice included ("Forward 10 seconds", "Volume 55%", "Captions on: English").',
      'Failed and offline are said at once, in an alert region mounted with the player.',
      '"Resumed from…" is said in words ("Resumed from 12 minutes, 34 seconds").',
      'Captions are drawn by the player as plain text; their markup is never rendered.',
    ],
  },
  focus: [
    "The picture's own button is out of the tab order: the bar's Play is the one keyboards reach.",
    'Hidden controls stay in the tab order; keyboard focus arriving shows them, and they stay while focus is among them.',
    "When Play in the middle, Replay, Try again or the resumed note goes while it holds focus, focus moves first to the bar's Play, without scrolling.",
    'Every control shows the two-tone on-media focus ring (light inside a dark edge, 3:1 over any picture) on keyboard focus only.',
  ],
  touchTarget: [
    'Bar buttons are 48px wide in a 40px container from a 30rem player; a narrower player has 32px buttons with 2px between them, above the 24px of WCAG 2.5.8.',
    "For a coarse pointer the scrubber's slot is taller, the volume slider and Rotate are left out.",
    'Nothing needs a drag or a double tap alone (WCAG 2.5.7): the scrubber and the volume take single presses and keys, and J and L skip.',
  ],
  motion: [
    "Under reduced motion the controls, the marks, the poster, the volume's opening and Rotate change at once; fades stay.",
    'An animated icon of yours passed through `icons` is told `reducedMotion`.',
    'A player with `inView="play"` doesn\'t start by itself under reduced motion.',
  ],
  consumer: [
    "Name the player with the video's title.",
    "Give captions for speech (`captions`, WebVTT), named by `label` where the language alone isn't enough.",
    'With `autoPlay` or `inView="play"`, the video starts muted where the browser insists; it can always be paused without turning the sound on.',
    'Translate `labels`, or set them once for the app with a `LabelsProvider`: the player says many words, from its role description to the marks its keys leave.',
    'In forced-colours mode the containers, marks and notices are drawn on `Canvas` with a `CanvasText` border, and an on control has a `Highlight` ground.',
  ],
};
