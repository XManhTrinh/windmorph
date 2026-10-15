---
'@windmorph/react': patch
---

`TimePicker`: tapping an hour on the dial now turns the hand to it and shows it for 100ms before switching to the minutes, as Compose does (a drag still switches on release); before, the hand went straight to the minute. Focus on the tapped number moves on to the chosen minute's number instead of dropping to the page when the face changes.
