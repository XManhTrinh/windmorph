// Writes the GitHub release for each package version the release workflow published
// (docs/plans/changelog-format.md). Changesets' publish action finds a version's notes only under
// a bare `## 0.2.2` heading, and the changelog's headings are dated (`## 0.2.2 — 2026-11-10`), so
// it would post the whole file; this posts the version's own section. A release that already
// exists is updated, so a re-run, or a run for an earlier version, corrects its notes.
//
//   node scripts/github-releases.mjs @windmorph/react@0.2.2 …
//   PUBLISHED='[{"name":"@windmorph/react","version":"0.2.2"}]' node scripts/github-releases.mjs
//   (the publish action's `published-packages` output). Needs `gh`, signed in or with GH_TOKEN.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** A version's section of a changelog, without its heading; undefined when it has none. */
export function releaseNotes(changelog, version) {
  const lines = changelog.split('\n');
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // `## 0.2.2`, or dated as `## 0.2.2 — 2026-11-10`; never `## 0.2.20`.
  const heading = new RegExp(`^## ${escaped}(?: — .*)?\\s*$`);
  const start = lines.findIndex((line) => heading.test(line));
  if (start === -1) return undefined;
  let end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  if (end === -1) end = lines.length;
  return lines
    .slice(start + 1, end)
    .join('\n')
    .trim();
}

/** `@scope/name@1.2.3` → its name and version. */
export function parseRelease(tag) {
  const at = tag.lastIndexOf('@');
  if (at <= 0) throw new Error(`github-releases: "${tag}" isn't a package@version tag.`);
  return { name: tag.slice(0, at), version: tag.slice(at + 1) };
}

function packageDirs() {
  const dirs = new Map();
  for (const entry of readdirSync('packages')) {
    const file = join('packages', entry, 'package.json');
    if (existsSync(file))
      dirs.set(JSON.parse(readFileSync(file, 'utf8')).name, join('packages', entry));
  }
  return dirs;
}

function releaseExists(tag) {
  try {
    execFileSync('gh', ['release', 'view', tag, '--json', 'tagName'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const releases = args.length ? args.map(parseRelease) : JSON.parse(process.env.PUBLISHED ?? '[]');
  const dirs = packageDirs();
  for (const { name, version } of releases) {
    const tag = `${name}@${version}`;
    const dir = dirs.get(name);
    if (!dir) throw new Error(`github-releases: no package named ${name} in packages/.`);
    const notes = releaseNotes(readFileSync(join(dir, 'CHANGELOG.md'), 'utf8'), version);
    if (!notes) throw new Error(`github-releases: ${dir}/CHANGELOG.md has no ${version} section.`);
    const update = releaseExists(tag);
    const command = update
      ? ['release', 'edit', tag, '--notes-file', '-']
      : ['release', 'create', tag, '--verify-tag', '--title', tag, '--notes-file', '-'];
    if (!update && version.includes('-')) command.push('--prerelease');
    execFileSync('gh', command, { input: notes, stdio: ['pipe', 'ignore', 'inherit'] });
    console.log(`github-releases: ${update ? 'updated' : 'created'} ${tag}.`);
  }
}
