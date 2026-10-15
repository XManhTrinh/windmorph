---
'@windmorph/react': minor
---

Single-selection `ChipSet` and `ButtonGroup` follow the WAI-ARIA radio group pattern their `radiogroup` role announces, as `RadioGroup` does: the arrow keys (and Home and End) move to a chip or button and select it, wrapping at the ends, and Tab enters at the selected one. `Toolbar`s and toolbar-style `ButtonGroup`s follow the APG toolbar: the arrow keys wrap at the ends and Home and End reach the first and last control; a text field in a toolbar keeps these keys for its caret.
