---
'@windmorph/react': patch
---

Fixed: in a multiple `Autocomplete`, rows of input chips are 48px apart, top to top (16px between them), so a chip no longer takes presses meant for the chip above it. Each further row adds 48px to the field instead of 40px.
