#!/usr/bin/env node
/**
 * Windmorph is its own product, so its public files carry no
 * trace of where it began: no former product name or prefix (non-M3 parts use `wm-`), no
 * Vietnamese sample text, and, in the files the public repo gets, no personal name
 * and no other UI library's name. Fails on any of them in a tracked file.
 *
 * The banned words, the old prefix and the letters are stored encoded (base64 or `\u`
 * escapes), so this file doesn't contain them itself.
 *
 * The Vietnamese check looks for letters only Vietnamese uses (a, o and u with a breve or
 * horn, and the precomposed tone-marked vowels, U+1EA0–U+1EF9); French and Croatian letters
 * are fine. Vietnamese dishes are welcome in food samples, so the words in `DISHES` are skipped.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const decode = (word) => Buffer.from(word, 'base64').toString('utf8');
const FORMER_NAME = decode('dmtpZXU=');
const PERSON = decode('bWlrZQ==');
const LIBRARY = decode('bXVp');
const PREFIX = decode('dms=');
const VIETNAMESE = new RegExp('[\\u0103\\u01a1\\u01b0\\u0102\\u01a0\\u01af\\u1ea0-\\u1ef9]');

/** Private files: they move to Windmorph Pro's repo and may keep the history. */
const PRIVATE_DOCS = /^(docs\/pro\/|agents\/|\.claude\/|CLAUDE\.md$|AGENTS\.md$)/;
/** Files the public repo doesn't get. */
const PRO_ONLY = /^(packages\/react-pro\/|docs\/pro\/|agents\/|\.claude\/|CLAUDE\.md$|AGENTS\.md$)/;
const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?)$/i;

/** Vietnamese dishes, allowed (and first choice) in food samples. */
const DISHES = ['phở', 'Phở', 'bún chả', 'Bún chả', 'gỏi cuốn', 'Gỏi cuốn', 'bánh xèo', 'Bánh xèo'];

const RULES = [
  {
    pattern: new RegExp(FORMER_NAME, 'i'),
    reason: 'names the former product',
    skip: PRIVATE_DOCS,
  },
  {
    pattern: new RegExp(
      String.raw`(?:^|[^\w/.-])${PREFIX}-[a-z]|--_?${PREFIX}-|\.${PREFIX}-[a-z]|data-${PREFIX}-|\b${PREFIX}\b`,
    ),
    reason: 'uses the old prefix',
    skip: PRIVATE_DOCS,
  },
  {
    pattern: VIETNAMESE,
    reason: 'has Vietnamese text',
    skip: PRIVATE_DOCS,
    strip: DISHES,
  },
  { pattern: new RegExp(`\\b${PERSON}\\b`, 'i'), reason: 'names a person', skip: PRO_ONLY },
  {
    pattern: new RegExp(`\\b${LIBRARY}\\b`, 'i'),
    reason: 'names another UI library',
    skip: PRO_ONLY,
  },
];

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter((file) => file && !BINARY.test(file));

const problems = [];
for (const file of files) {
  const rules = RULES.filter(({ skip }) => !skip.test(file));
  if (rules.length === 0) continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const { pattern, reason, strip = [] } of rules) {
        const checked = strip.reduce((text, word) => text.replaceAll(word, ''), line);
        if (pattern.test(checked)) problems.push(`${file}:${index + 1} ${reason}: ${line.trim()}`);
      }
    });
}

if (problems.length > 0) {
  console.error(`check-traces failed:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`check-traces passed (${files.length} files).`);
