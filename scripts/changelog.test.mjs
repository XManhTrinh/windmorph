import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatEntry } from '../.changeset/changelog.mjs';
import { changesetProblems } from './check-changesets.mjs';
import { formatChangelog } from './format-changelog.mjs';
import { parseRelease, releaseNotes } from './github-releases.mjs';

const generated = `# @windmorph/react

## 0.1.3

### Minor Changes

- Added: A \`fullWidth\` prop. ([#30](https://github.com/o/r/pull/30))

### Patch Changes

- Fixed: Sheets stay above the keyboard.
  A second line.
- fixed: lower-case kind is not a kind
- Changed: The menu opens faster.
- Security: A sanitised link.

## 0.1.2 — 2026-11-07

### Fixed

- An older entry.
`;

describe('formatChangelog', () => {
  const formatted = formatChangelog(generated, '2026-11-08');

  it('dates the newest version and groups its entries by kind, in order', () => {
    assert.match(formatted, /^## 0\.1\.3 — 2026-11-08$/m);
    const section = formatted.slice(0, formatted.indexOf('## 0.1.2'));
    const headings = [...section.matchAll(/^### (\w+)$/gm)].map((match) => match[1]);
    assert.deepEqual(headings, ['Added', 'Changed', 'Fixed', 'Security']);
    assert.doesNotMatch(section, /Changes$/m);
  });

  it('takes the kind off each entry and keeps its continuation lines and link', () => {
    assert.match(formatted, /^- A `fullWidth` prop\. \(\[#30\]/m);
    assert.match(formatted, /^- Sheets stay above the keyboard\.\n {2}A second line\.$/m);
    assert.doesNotMatch(formatted, /^- (Added|Fixed|Changed|Security):/m);
  });

  it('files an entry without a known kind under Changed', () => {
    const changed = formatted.slice(
      formatted.indexOf('### Changed'),
      formatted.indexOf('### Fixed'),
    );
    assert.match(changed, /lower-case kind is not a kind/);
  });

  it('leaves older versions alone, and changes nothing when run again', () => {
    assert.ok(formatted.endsWith('## 0.1.2 — 2026-11-07\n\n### Fixed\n\n- An older entry.\n'));
    assert.equal(formatChangelog(formatted, '2026-12-01'), formatted);
  });
});

describe('formatChangelog with a note', () => {
  it('keeps a note written above the groups, above the new groups', () => {
    const text =
      '# p\n\n## 0.2.0\n\nMove your gap classes to `classNames.panes`.\n\n### Patch Changes\n\n- Fixed: One.\n';
    assert.equal(
      formatChangelog(text, '2026-11-08'),
      '# p\n\n## 0.2.0 — 2026-11-08\n\nMove your gap classes to `classNames.panes`.\n\n### Fixed\n\n- One.\n',
    );
  });
});

describe('formatEntry', () => {
  it('ends the entry with its pull request, after any continuation lines', () => {
    assert.equal(
      formatEntry('Fixed: One.\nTwo.', 'o/r', 12),
      '- Fixed: One.\n  Two. ([#12](https://github.com/o/r/pull/12))',
    );
  });

  it('writes the entry without a link when no pull request was found', () => {
    assert.equal(formatEntry('Fixed: One.', 'o/r', undefined), '- Fixed: One.');
  });
});

describe('changesetProblems', () => {
  const changeset = (text) => `---\n'@windmorph/react': patch\n---\n\n${text}\n`;

  it('passes a changeset that starts with its kind', () => {
    assert.deepEqual(changesetProblems(changeset('Fixed: Sheets stay above the keyboard.')), []);
  });

  it('fails one without a kind, or with an unknown one', () => {
    assert.equal(changesetProblems(changeset('Sheets stay above the keyboard.')).length, 1);
    assert.match(changesetProblems(changeset('Improved: Faster.'))[0], /"Improved:"/);
    assert.equal(changesetProblems(changeset('')).length, 1);
  });
});

describe('releaseNotes', () => {
  const changelog = `# @windmorph/react

Intro.

## 0.2.20 — 2026-12-01

### Fixed

- Not this one.

## 0.2.2 — 2026-11-10

### Added

- \`SearchField\`.

### Fixed

- A carousel ring.

## 0.2.1

### Patch Changes

- An undated section.
`;

  it("gives a dated version's section alone, without its heading or the file's intro", () => {
    assert.equal(
      releaseNotes(changelog, '0.2.2'),
      '### Added\n\n- `SearchField`.\n\n### Fixed\n\n- A carousel ring.',
    );
  });

  it('finds an undated heading too, and the last section runs to the end', () => {
    assert.equal(releaseNotes(changelog, '0.2.1'), '### Patch Changes\n\n- An undated section.');
  });

  it('gives nothing for a version with no section', () => {
    assert.equal(releaseNotes(changelog, '0.2.3'), undefined);
    assert.equal(releaseNotes(changelog, '0.2'), undefined);
  });

  it('reads a scoped package@version tag', () => {
    assert.deepEqual(parseRelease('@windmorph/react@0.2.2'), {
      name: '@windmorph/react',
      version: '0.2.2',
    });
    assert.throws(() => parseRelease('0.2.2'));
  });
});
