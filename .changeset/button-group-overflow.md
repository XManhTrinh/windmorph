---
'@windmorph/react': minor
---

`ButtonGroup` gains `overflow`: the trailing buttons that don't fit fold into a "More options" menu (renamed with `labels.more`) and come back as the group widens. Connected groups give their buttons equal widths (`*:basis-auto` restores label widths), XS connected buttons press their inner corners to 2px, `buttonVariant` reaches icon buttons when they have that style, and the group warns in development about standard icon buttons, text buttons, and connected groups without toggles. Under reduced motion the press bump is off.
