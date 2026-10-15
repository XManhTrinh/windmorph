---
'@windmorph/react': minor
---

Icon buttons keep their density-0 size inside parts that keep their own size at every density: top app bars and search app bars, docked and floating toolbars (with their button groups), search bars and their views, a navigation rail's `header`, a full-screen `DialogHeader` and a `SideSheet`'s header, and the built-in close, back and collapse buttons of dialogs and sheets. `ButtonContext` takes a `density` for the icon buttons inside; an icon button's own `density` still wins.
