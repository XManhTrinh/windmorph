---
'@windmorph/react': minor
---

Chips follow the M3 Expressive spec: 8px corners for every chip type (filter and input chips no longer morph to 12px or round), 12px avatar corners, 8px between elements, `primary` leading icons on filter chips, a 48px target on the remove button with an 88px minimum chip width, and an `outline="strong"` option. New `ChipSet`: a labelled group with arrow-key navigation, one Tab stop, wrapping or scrolling, and shared single or multiple selection for filter chips. An input chip whose only action is removing it is now one focus stop. `FilterChip` takes `onRemove`. Breaking: `AssistChip` no longer takes `trailingIcon` (the spec gives assist chips no trailing icon); remove the prop.
