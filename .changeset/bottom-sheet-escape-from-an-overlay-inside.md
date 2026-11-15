---
'@windmorph/react': patch
---

Fixed: Escape pressed in a dialog or sheet opened from inside a `BottomSheet` no longer closes the bottom sheet behind it (or collapses an expanded standard one). The sheet handles Escape itself, and took the key from an overlay inside it that doesn't close on Escape (`closedBy="none"`, a dialog while it saves): the sheet closed, and the overlay with it. Escape that cancels a text being composed is left to the input method too.
