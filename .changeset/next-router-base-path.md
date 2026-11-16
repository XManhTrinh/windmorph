---
'@windmorph/react': patch
---

Added: `basePath` and `trailingSlash` on `NextRouterProvider`, the app's settings from `next.config`, so library links show the address Next's own `Link` writes (the base path in front, and the trailing slash `trailingSlash` asks for); navigation still goes through the router, which adds the base path itself.
