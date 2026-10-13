---
'@windmorph/react': minor
---

FABs follow the M3 Expressive spec: a new `elevation` prop (`default`, `lowered` or `flat`, level 0 for a FAB nested in another component such as the navigation rail); `visible` and `appear` animate the FAB in from its centre and out again (page and tab changes); `Fab` and `ToolbarFab` show their label in a tooltip on hover and focus (`tooltip={false}` turns it off); the large FAB icon is 32px; medium and large extended FABs put 16px and 20px between icon and label; and the extended FAB collapses and expands on the fast springs both ways. Breaking: `lowered` is replaced by `elevation="lowered"`.
