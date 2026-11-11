# Plan: changelog format

Status: **approved and built 2026-11-07**

## Goal

`packages/react/CHANGELOG.md` is Changesets' default output: each version is a bare `## 0.1.2`, its entries are grouped by the version bump (`### Patch Changes`), and each starts with a commit hash that isn't a link. The changelog should follow the common convention ([Keep a Changelog](https://keepachangelog.com)) while staying generated from changesets, so a release never needs hand-editing:

- a **date** on every version;
- entries grouped by **kind**: Added, Changed, Deprecated, Removed, Fixed, Security, in that order, empty groups left out;
- each entry ending with a **link to its pull request** instead of a commit hash;
- short entries: one or two sentences, the details behind the link.

```md
## 0.1.2 — 2026-11-07

### Added

- A development warning when a saved theme the server didn't render changes the theme while
  streamed content is still arriving. ([#18](https://github.com/XManhTrinh/windmorph/pull/18))

### Fixed

- `ThemeProvider` no longer makes React discard server HTML streamed behind a Suspense
  boundary on a dark device with `mode="system"`. ([#12](https://github.com/XManhTrinh/windmorph/pull/12))
```

The docs site's What's new page stays as it is: curated notes in plain words, the place to send people. The changelog is the complete record.

## Decisions

| # | Decision | Value |
|---|---|---|
| 1 | Kind | Each changeset's text starts with its kind: `Added:`, `Changed:`, `Deprecated:`, `Removed:`, `Fixed:` or `Security:`. A check (`scripts/check-changesets.mjs`, `pnpm check:changesets`, its own step in CI) fails on a changeset without one, so a missing kind is caught in the pull request, not at release. The kind is independent of the bump (`patch`, `minor`), which keeps choosing the version |
| 2 | PR links | A changelog function of our own (`.changeset/changelog.mjs`, set as `changelog` in `.changeset/config.json`) looks up the pull request that added each changeset (GitHub's "pull requests for a commit" API, with the workflow's `GITHUB_TOKEN`) and ends the entry with `([#N](…/pull/N))`. Without a token or a match (a local `changeset version`) it writes the entry with no link rather than failing. No author name: `@changesets/changelog-github` would add "Thanks @…!", which the public-repo rules rule out |
| 3 | Grouping and date | Changesets writes the version heading and the bump groups itself, so a step after it (`scripts/format-changelog.mjs`) rewrites only the new version's section: `## 0.1.2 — <date>`, entries moved under their kind, the kind prefix removed from the text. The release workflow's version step runs `pnpm version-packages` (`changeset version && node scripts/format-changelog.mjs`, the action's `script` input), with the whole git history (`fetch-depth: 0`), since Changesets finds each changeset's commit from it, and `GITHUB_TOKEN` for the pull-request lookup. The date is the day the Version packages PR is opened or updated; it's the release day in practice, as merging that PR publishes |
| 4 | Existing entries | 0.1.0, 0.1.1 and 0.1.2 are rewritten once by hand into the new format, with their dates and PR links (0.1.0 keeps its long launch summary under one Added entry) |
| 5 | Pro | Windmorph Pro's `CHANGELOG.md` gets the same format: the same changelog function and script, copied into the Pro repo (its releases are versioned by hand, so the script runs after `changeset version` there too), with links to Pro's pull requests |
| 6 | Docs | `docs/architecture.md`'s release section says how to write a changeset (kind first, one or two sentences, for the people who use the package) |

## Checks

- Built as plain Node scripts (`.mjs`), tested with Node's own runner (`pnpm test:scripts`, a CI step): the repository root has no TypeScript runner or test framework, and these needed none.
- Unit tests for `format-changelog` (grouping, ordering, the date, only the new section touched, no change when re-run) and for the changelog function (link found, no token, no match).
- `check-changesets` fails on a missing or unknown kind, and passes the existing changesets once updated.
- **GitHub releases** (2026-11-10): Changesets' publish action takes a release's notes from the section under a heading that is exactly the version, so with dated headings it posted the whole changelog (0.2.0 to 0.2.2). The release workflow turns its releases off (`create-github-releases: false`) and `scripts/github-releases.mjs` creates each one from its version's section, dated or not, updating a release that already exists; its tests are in `scripts/changelog.test.mjs`.
- A dry run of `changeset version` on a branch with a few test changesets produces the expected section; nothing is published.
