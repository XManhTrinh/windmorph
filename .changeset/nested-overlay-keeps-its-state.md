---
'@windmorph/react': patch
---

Fixed: a `Dialog` inside the content of a dialog that a `DialogTrigger` opened keeps its own open state. It took the trigger's instead of its own `open`, so it opened together with the outer dialog; each then made the other inert, and nothing in either could take focus or be pressed. A form's own dialog (an "Add a link", a "Discard changes?") now stays closed until its `open` says so, and closes alone. A modal `BottomSheet` or `SideSheet` inside a sheet that a `SheetTrigger` opened does the same.
