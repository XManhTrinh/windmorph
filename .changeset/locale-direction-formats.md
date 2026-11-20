---
'@windmorph/react': patch
---

Fixed: `localeWithDirection` and `DomDirectionLocale` (used by the toolbars, lists, sliders, radio groups, button groups, menus, tabs, and the date and time fields) keep the locale's hour cycle and calendar. Only the script changed before, so `zh-Hant-TW` or `en-GB` regions in the other direction changed their clock; the tag now keeps whichever of these the new script would change (`zh-Hant-TW` → `zh-Arab-TW-u-hc-h12`), and React Aria still reads the requested direction from it. The digits are the new script's in the tag (`ar-EG` → `ar-Latn-EG`), so an app's own React Aria number or date-segment input in a left-to-right region of an Arabic page still takes Latin digits; the components' own numbers there (a calendar's days, the time picker's dial, a progress indicator's value) are written in the page's digits.
