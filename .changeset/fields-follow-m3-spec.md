---
'@windmorph/react': minor
---

TextField, Select and Autocomplete follow the M3 Expressive spec:

- The required `*` is part of the accessible name ("Email \*"); tests that query a required field by its label need the asterisk.
- Error messages have the `alert` role (`ErrorText`), and invalid fields show an error icon named "Error" (`errorIcon`, `labels.error`; `false` turns it off).
- Supporting text and the counter take the error colour while the field is invalid.
- TextField: the counter is read as "Character count: 12 of 80" (`labels.characterCount`); the prefix and suffix describe the input, with `prefixLabel` / `suffixLabel`; `supportingTextOnFocus`; `data-readonly`.
- **Breaking:** `multiline` is now a fixed-height text area (`rows`, 4 by default) that scrolls. Add `autoGrow` for the old growing field (`rows` then defaults to 1, up to `maxRows`).
- The outlined label turns `on-surface` on hover.
- Select and Autocomplete: disabled options take keyboard focus but can't be chosen; the label no longer floats just because there's a placeholder (the placeholder shows once it floats); the list's scrollbar stays visible; options ease into place as the list filters.
- Select has `readOnly`; Autocomplete has `clearable` (`labels.clear`).
- Primitives: `CharacterCounter` takes a `label` for screen readers, and `FieldErrorIcon` is new.
