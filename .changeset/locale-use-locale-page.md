---
'@windmorph/react': patch
---

Changed: `useLocale().locale` is the page's locale in a toolbar, list, tab or menu laid out in the other direction too (it was React Aria's locale in another script there, `en-Arab-US` on an `en-US` page), while `direction` stays the region's, so the two may not match there: read `direction` rather than working it out from the locale, and don't pass this locale to a provider of your own inside such a region.
