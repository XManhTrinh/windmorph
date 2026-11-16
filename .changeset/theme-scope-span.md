---
'@windmorph/react': patch
---

Added: `ThemeScope` takes `as="span"`, so a scope can sit in content that takes only phrasing content (a `<button>`, a `<p>`, a `<label>`) without a `div` there. Its `ref` is typed for either element. Everything else works the same, overlays opened inside included.
