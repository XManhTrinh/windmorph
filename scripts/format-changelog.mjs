// Runs after `changeset version` (docs/plans/changelog-format.md). Changesets writes each new
// version as `## 0.1.2` with its entries under the version bump (`### Patch Changes`); this
// dates that heading and regroups its entries by kind (Added, Changed, Deprecated, Removed,
// Fixed, Security), taking the `Kind:` prefix off each entry. Only the newest section is
// touched, and a dated one is left alone, so running it twice changes nothing.
//
//   node scripts/format-changelog.mjs [CHANGELOG.md …]   (default: packages/react/CHANGELOG.md)
//   RELEASE_DATE=2026-11-07 sets the date (default: today, UTC).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const KINDS = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
const KIND_PREFIX = new RegExp(`^(${KINDS.join('|')}):\\s*`);
const BUMP_HEADING = /^### (Major|Minor|Patch) Changes\s*$/;
const VERSION_HEADING = /^## (\d+\.\d+\.\d+\S*)\s*$/;

/** The bullet entries of a section's lines: each `- ` line with the lines that continue it. */
function entries(lines) {
  const found = [];
  for (const line of lines) {
    if (line.startsWith('- ')) found.push([line]);
    else if (found.length && (line.startsWith('  ') || line.trim() === '')) found.at(-1).push(line);
  }
  return found.map((entry) => {
    while (entry.at(-1)?.trim() === '') entry.pop();
    return entry;
  });
}

/**
 * Dates the newest version's heading and groups its entries by kind. An entry without a kind
 * goes under Changed (`check-changesets` keeps that from happening in a pull request).
 */
export function formatChangelog(text, date) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.startsWith('## '));
  if (start === -1) return text;
  const heading = VERSION_HEADING.exec(lines[start]);
  // Already dated (`## 0.1.2 — 2026-11-07`), or not a version heading: nothing to do.
  if (!heading) return text;
  let end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  if (end === -1) end = lines.length;
  const body = lines.slice(start + 1, end);
  // Only a section in Changesets' layout is regrouped; anything else is just dated.
  const regroup = body.some((line) => BUMP_HEADING.test(line));
  let section;
  if (regroup) {
    // A note written above the groups (a migration step, say) stays above them.
    const firstGroup = body.findIndex((line) => BUMP_HEADING.test(line));
    const note = body.slice(0, firstGroup).join('\n').trim();
    const groups = new Map(KINDS.map((kind) => [kind, []]));
    for (const entry of entries(body.filter((line) => !BUMP_HEADING.test(line)))) {
      const text = entry[0].slice(2);
      const prefix = KIND_PREFIX.exec(text);
      const kind = prefix?.[1] ?? 'Changed';
      const rest = text.slice(prefix?.[0].length ?? 0);
      // With its kind taken off, the entry starts with a capital, as a sentence.
      const first = prefix ? rest.charAt(0).toUpperCase() + rest.slice(1) : rest;
      groups.get(kind).push([`- ${first}`, ...entry.slice(1)].join('\n'));
    }
    section = note ? ['', note] : [];
    section.push(
      ...KINDS.filter((kind) => groups.get(kind).length).flatMap((kind) => [
        '',
        `### ${kind}`,
        '',
        groups.get(kind).join('\n'),
      ]),
    );
    section.push('');
  } else {
    section = body;
  }
  return [
    ...lines.slice(0, start),
    `## ${heading[1]} — ${date}`,
    ...section,
    ...lines.slice(end),
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const date = process.env.RELEASE_DATE ?? new Date().toISOString().slice(0, 10);
  const files = process.argv.slice(2);
  for (const file of files.length ? files : ['packages/react/CHANGELOG.md']) {
    const text = readFileSync(file, 'utf8');
    const formatted = formatChangelog(text, date);
    if (formatted !== text) {
      writeFileSync(file, formatted);
      console.log(`format-changelog: dated and grouped the newest version in ${file}.`);
    }
  }
}
