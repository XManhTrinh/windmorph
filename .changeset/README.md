# Changesets

Every user-visible change to `@windmorph/react` needs a changeset: run `pnpm changeset` and commit the generated file. Tests, the docs site and tooling need none.

Start its text with its kind, then one or two sentences for the people who use the package (what changed and what to do, if anything); the details go in the pull request:

```md
---
'@windmorph/react': patch
---

Fixed: Bottom sheets stay above the on-screen keyboard.
```

The kind is one of `Added:`, `Changed:`, `Deprecated:`, `Removed:`, `Fixed:` or `Security:` (`pnpm check:changesets` checks it, in CI too). It groups the entry in `CHANGELOG.md`; the bump (`patch`, `minor`) still picks the version. At release, each entry is dated, grouped by kind and linked to its pull request (`.changeset/changelog.mjs`, `scripts/format-changelog.mjs`; `docs/plans/changelog-format.md`).
