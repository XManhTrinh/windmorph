import type { ComponentAccessibility } from './types';

export const list: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus into the list and out of it. An interactive list or a radio list is one Tab stop; in a plain list each link, switch or checkbox item is its own Tab stop.',
    },
    {
      keys: ['Arrow Down', 'Arrow Up'],
      action:
        'Moves focus to the next or previous item, wrapping at the ends. In an interactive list a disabled item takes focus too, so screen reader users find it, but Enter, Space and a press do nothing on it.',
      where: 'Interactive lists and plain lists of links',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves focus to the first or last item.',
      where: 'Interactive lists and plain lists of links',
    },
    {
      keys: ['Enter'],
      action:
        "Runs `onAction` with the item's key, or follows a link item. In a selectable list it selects the item.",
      where: 'Interactive lists and plain lists of links',
    },
    {
      keys: ['Space'],
      action: 'Selects or deselects the focused option.',
      where: 'With `selectionMode`',
    },
    {
      keys: ['A letter'],
      action: 'Moves focus to the next item whose headline starts with the typed letters.',
      where: 'Interactive lists',
    },
    {
      keys: ['Arrow Right', 'Arrow Left'],
      action:
        'Moves focus between the item and a control in its trailing content, such as a switch.',
      where: 'With `onAction`',
    },
    {
      keys: ['Arrow Right', 'Arrow Left'],
      action: 'Expands or collapses the focused item.',
      where: 'Items with `childItems`',
    },
    {
      keys: ['Space'],
      action: 'Switches the item on or off.',
      where: 'Switch and checkbox items',
    },
    {
      keys: ['Arrow Down', 'Arrow Up'],
      action: 'Moves the choice to the next or previous item.',
      where: 'Radio list',
    },
  ],
  keyboardNotes: [
    'Arrow keys move across sections as through one list.',
    "In a plain list, each link stays a real anchor: the browser's link menu, status bar and new-tab clicks work, and a plain click goes through the app's router. Disabled link items have no link and are skipped.",
  ],
  screenReader: {
    role: 'A plain `ul` of `li` items. With `onAction`, or links in a list that acts, a `grid` of `row`s; with `selectionMode` (and no `onAction` or links) a `listbox` of `option`s, as M3 asks on the web; with `childItems` a `treegrid`. A switch or checkbox item is a native checkbox (with `role="switch"` for a switch), and a radio list is a `radiogroup` of native radio buttons.',
    name: "The list takes `aria-label` or `aria-labelledby`, which its types require. An item is named by its headline, and an option in a selectable list by all of its visible text (overline, headline, supporting and trailing text, in that order), so its name holds every word it shows and each is read once. Give a headline that isn't plain text a `textValue`, used for typeahead and announcements. A `ListSection` is named by its subheader (`title`), or its `aria-label`.",
    states:
      'Selected (`aria-selected`) in a selectable list, disabled, expanded or collapsed (`aria-expanded`) with its level and position (`aria-level`, `aria-posinset`, `aria-setsize`) in a tree, `aria-current="page"` on a `current` link item, and on or off for a switch or checkbox item.',
    notes: [
      'A switch or checkbox item is one control, named by its headline and described by its overline and supporting text.',
      "A link item's link is its headline, with an overlay over the whole item, so buttons in its trailing content stay their own controls.",
      'Selected items show a check as well as their colour, so selection never relies on colour alone; `selectionIndicator={false}` hides it.',
      "Nested items that are closing are hidden from assistive tech and can't take focus.",
    ],
  },
  focus: [
    'In an interactive list one item at a time is in the Tab order; the arrow keys move focus between items (roving focus). The expand chevron of a tree item is not a Tab stop: the item expands with the arrow keys or a press.',
    "Keyboard focus shows M3's focus indicator inside the item, a 3px `secondary` outline drawn within its edges, since items are full-bleed; a focused item also takes its active corner shape. Pointer presses show no ring.",
    'In a plain list only link, switch and checkbox items take focus. A radio list is one Tab stop, on the chosen item.',
  ],
  touchTarget: [
    'Items are at least 56px tall (one line), 72px (two lines) or 88px (three lines), and as wide as the list.',
    'The expand chevron of a tree item gets an invisible 48 × 48px `TouchTarget`.',
    "With `density` (or the theme's), items lose 4px a step (one line 44px at -3). They're stacked rows, so each keeps a full-row target that never overlaps the next, above WCAG 2.5.8's 24px minimum, and the chevron's target is at most one row tall. M3 lets lists adjust their density; leave it to the reader's choice.",
  ],
  motion: [
    'Under reduced motion nested items only fade in and out instead of also opening their height. When items open as others fold (an app keeping one item open), the folding ones go at once and the opening ones fade in, so the items below move once. The expand chevron flips without rotating. Item corners snap to their new shape, and the press ripple appears at full size without growing.',
    'When a press opens an item while an open item above it folds, the item pressed stays where it is on screen, with or without reduced motion: the page scrolls by the folded height as the rows close, so nothing moves out from under the finger or pointer.',
  ],
  consumer: [
    'Name every list with `aria-label`, or `aria-labelledby` pointing at a visible heading.',
    "Give an item whose headline isn't plain text a `textValue`; the list warns when one is missing.",
    "Don't put buttons or links in the items of a selectable list (options can't hold them); use `onAction` for a list whose items hold controls, and give each trailing control its own name.",
    "Keep switch and checkbox items in their own list, without `onAction`, links, `selectionMode` or `childItems`: a row can't be two controls, and the list throws an error. To pair an action with a switch, put a {@link Switch} in the item's trailing content.",
  ],
};
