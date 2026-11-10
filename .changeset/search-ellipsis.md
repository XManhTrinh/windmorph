---
'@windmorph/react': patch
---

Fixed: A `SearchField` or `SearchBar` hint longer than the field, or a query while the field isn't focused, ends in an ellipsis instead of being cut off mid-letter, as a text field's label does. A searchable `Select`'s search, which draws the same pill, does too.
