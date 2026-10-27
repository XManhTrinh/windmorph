import type { ComponentAccessibility } from './types';

export const menu: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Enter', 'Space', 'Arrow Down'],
      action: 'Opens the menu and focuses its first item.',
      where: 'On the trigger',
    },
    {
      keys: ['Arrow Up'],
      action: 'Opens the menu and focuses its last item.',
      where: 'On the trigger',
    },
    {
      keys: ['Shift + F10'],
      action:
        'Opens a `ContextMenuTrigger` menu, as do the context-menu key and, on macOS, Control + Enter.',
      where: 'On a context menu target',
    },
    {
      keys: ['Arrow Down', 'Arrow Up'],
      action: 'Moves focus to the next or previous item, wrapping at the ends.',
      where: 'In the menu',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves focus to the first or last item.',
      where: 'In the menu',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Runs the item (`onAction`) and closes the menu. In a selectable menu it selects the item; a multi-select menu stays open until it is dismissed. On a submenu item it opens the submenu.',
      where: 'In the menu',
    },
    {
      keys: ['A letter'],
      action:
        'Moves focus to the next item starting with that letter; typing a few letters quickly matches a longer label.',
      where: 'In the menu',
    },
    {
      keys: ['Arrow Right'],
      action: 'Opens the submenu of the focused item and focuses its first item.',
      where: 'On a submenu item',
    },
    {
      keys: ['Arrow Left'],
      action: 'Closes the submenu and returns focus to the item that opened it.',
      where: 'In a submenu',
    },
    {
      keys: ['Escape'],
      action:
        'Closes the menu and returns focus to the trigger. In a submenu it closes only the submenu and returns focus to its item, in a popover and in a sheet.',
      where: 'In the menu',
    },
    {
      keys: ['Tab'],
      action:
        'Closes the menu and all its submenus, and moves focus on past the trigger (back to the trigger when nothing follows it).',
      where: 'In the menu',
    },
  ],
  keyboardNotes: [
    'In a right-to-left layout Arrow Left opens a submenu and Arrow Right closes it.',
    'Items in `disabledKeys` take focus as the arrows pass them, as M3 asks, but do nothing. Dividers and group headings never take focus.',
  ],
  screenReader: {
    role: '`menu` holding `menuitem`s; `menuitemradio` or `menuitemcheckbox` in a single- or multi-select menu. A `MenuGroup` is a `group`. With `presentation="sheet"` the menu sits in a modal bottom sheet, a `dialog` named like the menu.',
    name: "From a `MenuTrigger`, the menu is named by its trigger's label, and a submenu by the item that opens it. A `ContextMenuTrigger` menu, and a `MenuGroup` without a visible heading, take their own `aria-label`. An item is named by its label and its `description`, in that order, so its name holds the text it shows; an `aria-label` replaces both.",
    states:
      'The trigger announces that it opens a menu (`aria-haspopup`) and whether it is open (`aria-expanded`); a context menu target announces neither. Items announce checked (`aria-checked`) in a selectable menu, disabled (`aria-disabled`), and a submenu item announces its submenu (`aria-haspopup="menu"`, `aria-expanded`).',
    notes: [
      "An item's `badge` and `shortcut` (shown as a `<kbd>`) are read once, as its accessible description, after its name.",
      'Leading, trailing and selected icons, and the submenu arrow, are decorative and hidden from assistive tech (`aria-hidden`).',
      'While the menu is open the rest of the page is hidden from assistive tech.',
    ],
  },
  focus: [
    'Opening the menu focuses its first item, or its last with Arrow Up from the trigger. Focus stays inside the menu while it is open, moving between items with the arrows.',
    "Keyboard focus shows M3's focus indicator inside the item, a 3px `secondary` outline drawn within its edges so the menu's clipping never hides it. Pointer presses show no ring.",
    'Choosing an item, Escape or a press outside closes the menu and returns focus to the trigger. While the menu is open the trigger keeps its pressed state layer.',
    "In a sheet, a submenu replaces its menu below a back button (named by `labels.back`), and going back returns focus to the submenu's item.",
  ],
  touchTarget: [
    "Items fill the menu's width (112 to 280px) and are at least 44px tall, 4px under the 48px minimum; each `density` step takes 4px more off. They have no `TouchTarget`. The back button above a submenu in a sheet is 48px.",
    'For touch, keep `density` at 0, or use `presentation="auto"`, which opens the menu in a bottom sheet on compact windows.',
  ],
  motion: [
    "Under reduced motion the menu only fades: it isn't revealed from its anchored edge. The press ripple appears at full size without growing, and corner morphs (a selected item's, and the menus' while a submenu is open) snap. `instant` turns the open and close motion of a popover menu off entirely; a menu shown as a bottom sheet keeps the sheet's motion.",
  ],
  consumer: [
    'Give an icon-only trigger an `aria-label` (an {@link IconButton} requires one).',
    'Give every `ContextMenuTrigger` menu an `aria-label`, and every `MenuGroup` without a visible heading an `aria-label`.',
    "Make a `ContextMenuTrigger`'s target focusable (a link, a button, or `tabIndex={0}` with a visible focus indicator), so Shift + F10 and the context-menu key can reach it and Escape returns focus to it. Keep every action of the menu available another way too, as context menus are hard to discover.",
    'Pass `labels` to translate the back button of a sheet.',
    'Use `disabledKeys` rather than removing an item when people should still learn it exists.',
  ],
};
