---
'@windmorph/react': patch
---

`Dialog`'s initial focus goes to the least destructive action by an explicit rule: when its first interactive element is one of its actions, focus goes to the dismissive action, the first on one line and the bottom one when the actions stack, whenever the stack forms.
