---
'@windmorph/react': patch
---

Fixed: `normalizeSearch` and `matchesSearch` (Select, Autocomplete) fold ø, ł, ß, æ, œ, þ, ð and the dotless ı too, so "lodz" finds "Łódź" and "strasse" finds "Straße". `ß` becomes two letters, so a normalized string can be longer than the text.
