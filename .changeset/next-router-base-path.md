---
'@windmorph/react': patch
---

Added: `basePath` on `NextRouterProvider`, the app's `basePath` from `next.config`, so library links show it in their address as Next's own `Link` does; navigation still goes through the router, which adds it itself.
