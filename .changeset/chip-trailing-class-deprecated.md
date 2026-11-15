---
'@windmorph/react': patch
---

Deprecated: `classNames.trailing` on `AssistChip`, `SuggestionChip` and `InputChip`. It landed on nothing, since only a filter chip has a trailing icon; `FilterChip` keeps it for its `trailingIcon`. The docs' props tables leave deprecated keys out.
