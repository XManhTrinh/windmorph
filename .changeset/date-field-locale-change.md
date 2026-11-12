---
'@windmorph/react': patch
---

Fixed: A `DateField`, and the date pickers' text input, write their text again when the locale changes. Before, the text kept the old locale's format while the field read it in the new one's order. A server-rendered field with a value changes locale by itself without a `LocaleProvider`, from the server's `en-US` to the browser's language, so 5 March, shown as `03/05/2030`, became 3 May when the field lost focus in a day-first browser.
