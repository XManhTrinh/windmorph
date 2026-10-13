---
'@windmorph/react': patch
---

`List` no longer inspects its children's element types. In a plain or radio list, `ListItem` and `ListSection` render themselves and learn their place (position, section, disabled state) through context, so items and sections created in a React Server Component render the same as ones created in the browser. The rendered markup is unchanged.
