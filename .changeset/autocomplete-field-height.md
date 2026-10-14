---
'@windmorph/react': patch
---

`Autocomplete` keeps its 56px field while the clear button shows: the button now sits beside the value, before the arrow, with a 48px touch target, instead of making the field 72px tall once text was typed or an option chosen. With `selectionMode="multiple"`, one row of input chips keeps an outlined field (or a filled one without a label) at 56px, and a filled field with a label at 64px, with 40px for each further row (before, a first chip made either 72px).
