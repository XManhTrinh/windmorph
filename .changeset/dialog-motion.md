---
'@windmorph/react': minor
---

Dialogs enter and leave with the full M3 dialog motion. Entering, the dialog slides 50px away from the window edge it sits against while its container grows from that edge (with the panel's rounded corners on every frame), the headline and supporting text fade in after 50ms and the actions after 150ms, and the scrim fades in on a slower spring. Leaving, the parts fade out first, the dialog slides back while its container shrinks to 35%, then it fades. The direction follows `placement` (down for centre and top, up for bottom, along the x axis for start and end, mirrored in right-to-left layouts). Any children take part: `DialogActions`, or any child with `data-slot="actions"`, fades in with the actions, and every other child with the content. Reduced motion keeps only the fades of the dialog and the scrim. `PickerDialog` (the date and time picker dialogs) moves the same way; the full-screen dialog keeps its slide up and fade.

New `Dialog` props: `quick` turns the motion off (the dialog leaves the document as soon as it closes), and `onOpened` and `onClosed` fire once the enter and exit motion have finished. `usePresence` (from `/primitives`) takes an optional third argument, `animated`: when false, `isPresent` follows `isOpen` at once. `dialogStyles` has a new `parts` slot (the staggered fades, for the panel) and a `quick` variant; the motion's `--m3-dialog-collapsed` variable is replaced by `--m3-dialog-enter-clip`, `--m3-dialog-exit-clip`, `--m3-dialog-open-clip`, `--m3-dialog-slide` and `--m3-dialog-corner`.

Leaving, the dialog's slide and shrink run on the critically damped fast effects spring, so they stop at 50px and 35% instead of overshooting while the dialog is still visible.
