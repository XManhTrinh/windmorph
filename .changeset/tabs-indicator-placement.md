---
'@windmorph/react': patch
---

Tabs animate only selection changes: the indicator and the default selection's colour appear in place on first paint instead of sliding or fading in, and the indicator follows the selected tab's content when only that resizes (for example when a web font loads).
