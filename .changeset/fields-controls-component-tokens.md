---
'@windmorph/react': minor
---

Component tokens for the text field and the selection controls (40 in all; defaults unchanged, and `className` still wins):

- Text field, and the Select and Autocomplete fields that share its look: `--md-comp-filled-text-field-*` (container colour and shape, active indicator and focused active indicator) and `--md-comp-outlined-text-field-*` (container shape, outline, hovered and focused outline), plus, for both, the label, focused label, input text, caret, supporting text and leading and trailing icon colours. `textFieldTokenSet` is exported.
- Checkbox: `--md-comp-checkbox-selected-container-color`, `-selected-icon-color` and `-unselected-outline-color` (`checkboxTokenSet`).
- Radio: `--md-comp-radio-button-selected-icon-color` and `-unselected-icon-color` (`radioTokenSet`).
- Switch: `--md-comp-switch-{selected,unselected}-{track,handle,icon}-color` and `--md-comp-switch-unselected-track-outline-color` (`switchTokenSet`).
- Slider: `--md-comp-slider-active-track-color`, `-inactive-track-color`, `-handle-color`, `-stop-indicator-color`, `-value-indicator-container-color` and `-value-indicator-label-label-text-color` (`sliderTokenSet`). A slider's root now carries `data-size` (a public styling hook).

List items that are checkboxes or radio buttons draw the same box and ring, and switch items the same thumb, so those parts follow these tokens too.
