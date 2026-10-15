---
'@windmorph/react': patch
---

A filled `TextField` (and filled `Select` and `Autocomplete`) at density -2 or -3, below 52px, now hides its label once it floats and centres the value, as Material's web text field does; the floated label used to touch the value. The resting label still shows in an empty field and still names it.
