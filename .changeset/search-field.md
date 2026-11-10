---
'@windmorph/react': patch
---

Added: `SearchField`, a search box that filters content in place (a settings page, a table, a list pane), drawn as the search bar's 56px pill and filling its container. It never opens a search view: Escape clears the query, Enter calls `onSubmit`, and a clear button (`labels.clear`, `clearIcon`) shows while there's text. It reads the search bar's tokens, so a theme or scoped override restyles both. `SearchBar` and a searchable `Select` now draw the same pill, with no visual change.
