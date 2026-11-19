---
'@windmorph/react': patch
---

Fixed: Inside a toolbar, list, tab or menu laid out in the other direction, the components write and read their dates, times and numbers in the page's locale. Such a region gives React Aria the locale in another script for its arrow keys, which formats as the language's default, so an `en-GB` `DateField` in a right-to-left region showed MM/DD/YYYY and saved 03/04/2030 as 4 March, and `fr-CA`'s 15 h 05 came out 15:05. The date and time fields, the pickers' headlines and weekdays, Slider's value, Badge, Carousel, `AnimatedNumber` and the typeahead of `Menu`, `Select` and `List` now keep the page's locale there; only React Aria's own words, such as a calendar day's accessible name, follow the changed one.
