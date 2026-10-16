import type { ComponentAccessibility } from './types';

export const imageCrop: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        "Moves between the dialog's buttons and, in the cropper, the photo area, Zoom out, the zoom slider and Zoom in.",
    },
    {
      keys: ['Arrow Up', 'Arrow Down', 'Arrow Left', 'Arrow Right'],
      action:
        'Move the photo 10px that way, or 50px with Shift. It stops where it would leave a gap in the frame.',
      where: 'On the photo area',
    },
    {
      keys: ['+', '-'],
      action: 'Zoom in or out by 10% (`=` and `_` work too).',
      where: 'On the photo area',
    },
    {
      keys: ['0'],
      action: 'Resets the photo to fill the frame, centred.',
      where: 'On the photo area',
    },
    {
      keys: ['Arrow Left', 'Arrow Right'],
      action: 'Change the zoom, as on any {@link Slider}.',
      where: 'On the zoom slider',
    },
    { keys: ['Escape'], action: 'Closes the dialog, except while `busy`.', where: 'In the dialog' },
  ],
  keyboardNotes: ['The arrow keys move the photo the way they point in every layout direction.'],
  screenReader: {
    role: 'In the dialog, a `dialog` named by its title. Inside, the photo area is a `group`, the zoom control a `slider`, and Zoom out and Zoom in are buttons.',
    name: 'The photo area is named by `labels.area` ("Photo position") and described by `labels.instructions`, which say how to move and zoom from the keyboard. The slider is named by `labels.zoom` and the buttons by `labels.zoomOut` and `labels.zoomIn`.',
    states:
      'The slider reads its value as a percentage ("150%"). Zoom out and Zoom in are disabled at their limits, and Save until the photo is ready.',
    notes: [
      'The photo itself is decorative (`alt=""`); the frame and the circle guide are hidden from assistive tech.',
      "A photo that can't be opened (HEIC in some browsers, or a file that isn't an image) shows `labels.error` in an `alert` region that goes into the page before the message, so it is announced, and Save stays disabled.",
      'The zoom buttons show their names as tooltips through the icon button, without reading them twice.',
      "While `busy`, a progress bar named by `labels.busy` shows, Cancel and Save are disabled, and the dialog can't be dismissed.",
    ],
  },
  focus: [
    "The photo area joins the Tab order once the photo has loaded, and shows M3's focus indicator on keyboard focus: a 3px `secondary` outline 2px outside it.",
    'When Zoom out or Zoom in reaches its limit and turns itself off, focus moves to the other zoom button (or the photo area) instead of dropping to the page.',
    'The dialog moves focus to its first interactive element when it opens, keeps focus inside, and returns it to what opened it when it closes, as any {@link Dialog} does.',
  ],
  touchTarget: [
    "The photo area spans the cropper's full width, with 24px around the frame.",
    'Zoom out and Zoom in are small icon buttons (40px) with an invisible 48 × 48px touch target.',
    'Dragging is never required: the zoom slider and buttons zoom, and the arrow keys move the photo (WCAG 2.2, 2.5.7). A pointer drags the photo, two fingers pinch to zoom, and Ctrl or ⌘ with the wheel (or a trackpad pinch) zooms around the pointer; a plain wheel scrolls the page.',
    'Inline, a vertical swipe over the photo scrolls the page until it is zoomed in, so the cropper never traps a touch screen; inside the dialog every gesture moves the photo.',
  ],
  motion: [
    'Resetting with 0 eases the photo back into place; under reduced motion it jumps there. Dragging, pinching and the wheel follow the pointer without easing.',
    'The dialog opens and closes with the {@link Dialog} motion.',
  ],
  consumer: [
    'Pass `labels` from your translations, including `instructions`, the only place the keyboard controls are explained.',
    'Keep the dialog open while you upload (`busy`, with `progress` when you know it), and close it yourself when the upload ends.',
    'Offer a file type the browser can show (JPEG or PNG): pick files with `accept` on a {@link FileTrigger}, and expect the error for others.',
    'In forced-colours mode the frame edge and the circle guide use the system text colour and the photo around the frame stays dimmed but visible; keep `classNames` overrides from removing them.',
    'Give a custom `zoomInIcon` or `zoomOutIcon` no name of its own: the button is named by `labels`.',
  ],
};
