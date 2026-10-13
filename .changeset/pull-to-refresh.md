---
'@windmorph/react': minor
---

New `PullToRefresh`: at the top of its content, a downward touch, mouse or pen drag pulls a contained loading indicator in from the top edge. Releasing past the threshold (80px) calls `onRefresh`, and the indicator stays, as an indeterminate loading indicator, until `refreshing` is `false`; releasing short of it, or pushing back, cancels. Scrolling is untouched, refresh start and completion are announced politely, and a refresh button that sets `refreshing` brings the same indicator in. Motion and sizes follow Compose's `PullToRefreshBox` with `PullToRefreshDefaults.LoadingIndicator`.
