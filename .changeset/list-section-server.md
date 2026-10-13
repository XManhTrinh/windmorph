---
'@windmorph/react': patch
---

A `ListSection` created in a React Server Component now renders as a section of a static `List`. It reached the client as a client reference, which the list didn't recognise, so it rendered as an empty item.
