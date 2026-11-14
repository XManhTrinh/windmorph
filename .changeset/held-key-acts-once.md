---
'@windmorph/react': patch
---

Fixed: Enter or Space held long enough to repeat acts once in three places. On a time picker's dial, picking an hour moves focus to the minutes, where the repeat picked a minute too and moved the time to the nearest five; in a search bar, the repeat of the Enter that opened the view submitted the query as it stood; on a bottom sheet's drag handle, it went on to the next size and closed a modal sheet it had just opened fully.
