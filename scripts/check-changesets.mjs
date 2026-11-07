// Fails when a changeset's text doesn't start with its kind (docs/plans/changelog-format.md),
// so the changelog can group it: `Added:`, `Changed:`, `Deprecated:`, `Removed:`, `Fixed:`
// or `Security:`. Run in CI, so a missing kind is caught in the pull request, not at release.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KINDS } from './format-changelog.mjs';

/** The changeset's text: what follows its front matter. */
function changesetText(source) {
  const match = /^---\n[\s\S]*?\n---\n([\s\S]*)$/.exec(source);
  return (match ? match[1] : source).trim();
}

/** The problems with one changeset's source, empty when it's fine. */
export function changesetProblems(source) {
  const text = changesetText(source);
  if (!text) return ['has no text'];
  const kind = /^(\w+):/.exec(text)?.[1];
  if (!kind) return [`doesn't start with its kind (${KINDS.map((k) => `${k}:`).join(', ')})`];
  if (!KINDS.includes(kind)) return [`starts with "${kind}:", not one of ${KINDS.join(', ')}`];
  return [];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2] ?? '.changeset';
  const failures = readdirSync(dir)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .flatMap((name) =>
      changesetProblems(readFileSync(join(dir, name), 'utf8')).map(
        (problem) => `${name} ${problem}`,
      ),
    );
  if (failures.length) {
    console.error(`check-changesets failed:\n${failures.map((f) => `  ${f}`).join('\n')}`);
    process.exit(1);
  }
  console.log('check-changesets passed.');
}
