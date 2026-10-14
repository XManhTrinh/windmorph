---
'@windmorph/react': patch
---

Parts loaded on demand (built-in tooltips, the list's loading indicator, the bottom sheet of a `Menu` or `Select` that opens in one) also load when the browser is first idle after the page mounts, so the first hover or open is usually instant. Nothing preloads on the server, or when the user has asked to save data (`navigator.connection.saveData`).
