---
'@windmorph/react': patch
---

Fixed: `localeWithDirection` and `DomDirectionLocale` (used by the toolbars, lists, sliders, radio groups, button groups, menus, tabs, and the date and time fields) keep the locale's digits, hour cycle and calendar. Only the script changed before, so a left-to-right region of an `ar-EG` page wrote Latin digits (`ar-Latn-EG`), and `zh-Hant-TW` or `en-GB` regions in the other direction changed their clock; the tag now keeps whichever of these the new script would change (`ar-EG` → `ar-Latn-EG-u-nu-arab`), and React Aria still reads the requested direction from it.
