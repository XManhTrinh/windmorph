---
'@windmorph/react': minor
---

`ButtonGroup` follows the M3 Expressive spec: standard groups space their buttons 18 / 12 / 8 / 8 / 8px apart by size; connected groups never widen a pressed button (only its shape changes), span their container (add `w-fit` to hug the content), use 4 / 8 / 8 / 16 / 20px inner corners by size, honour `shape="square"`, and keep XS and S icon buttons at least 48px wide. Without a selection mode the group is now a `toolbar` whose arrow keys move between its buttons.
