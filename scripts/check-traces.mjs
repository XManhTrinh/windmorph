#!/usr/bin/env node
/**
 * Windmorph is its own product, so its public files carry no
 * trace of where it began: no former product name or prefix (non-M3 parts use `wm-`), no
 * Vietnamese sample text, and, in the files the public repo gets, no personal name,
 * no other UI library's name and no other product's name (docs describe a pattern, such as
 * "a comment field that opens on first focus", instead of naming an app that uses it). Fails
 * on any of them in a tracked file.
 *
 * The banned words, the old prefix and the letters are stored encoded (base64 or `\u`
 * escapes), so this file doesn't contain them itself.
 *
 * The Vietnamese check looks for letters only Vietnamese uses (a, o and u with a breve or
 * horn, and the precomposed tone-marked vowels, U+1EA0–U+1EF9); French and Croatian letters
 * are fine. Vietnamese dishes are welcome in food samples, so the words in `DISHES` are skipped.
 *
 * Product names match as whole words. Those that are also English words (the chat app named
 * like a loose rope, …) match only capitalised, and the bare team-chat name only mid-sentence
 * (after a lowercase word or a comma), so the plain word "teams", or "Teams" opening a
 * sentence, passes. Lockfiles and generated files aren't checked for them.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const decode = (word) => Buffer.from(word, 'base64').toString('utf8');
const FORMER_NAME = decode('dmtpZXU=');
const PERSON = decode('bWlrZQ==');
const LIBRARY = decode('bXVp');
const PREFIX = decode('dms=');
/** Product names that are never English words: matched in any case. */
const PRODUCTS = decode(
  'RmFjZWJvb2ssV2hhdHNBcHAsSW5zdGFncmFtLGlNZXNzYWdlLFRpa1RvayxMaW5rZWRJbixUd2l0dGVyLEdtYWlsLE1pY3Jvc29mdCBUZWFtcyxHb29nbGUgUGhvdG9zLEFwcGxlIFBob3RvcyxDaGF0R1BU',
).split(',');
/** Product names that are also English words: matched only capitalised. */
const CASED_PRODUCTS = decode(
  'U2xhY2ssTWVzc2VuZ2VyLFRlbGVncmFtLERpc2NvcmQsR2VtaW5pLENsYXVkZQ==',
).split(',');
/**
 * Allowed: the social-card metadata standard is named after a product, so its keys
 * (`<meta name="…:card">`, Next.js's `metadata.…` field) keep that name.
 */
const SOCIAL_CARD_KEY = new RegExp(`\\b${PRODUCTS[6]}(?=:)`, 'gi');
/** The team-chat product: matched only capitalised mid-sentence. */
const TEAM_CHAT = decode('VGVhbXM=');
const VIETNAMESE = new RegExp('[\\u0103\\u01a1\\u01b0\\u0102\\u01a0\\u01af\\u1ea0-\\u1ef9]');

/** Private files: they move to Windmorph Pro's repo and may keep the history. */
const PRIVATE_DOCS = /^(docs\/pro\/|agents\/|\.claude\/|CLAUDE\.md$|AGENTS\.md$)/;
/** Files the public repo doesn't get. */
const PRO_ONLY = /^(packages\/react-pro\/|docs\/pro\/|agents\/|\.claude\/|CLAUDE\.md$|AGENTS\.md$)/;
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|mp4|webm|pdf)$/i;
/** Lockfiles and generated files: product names there come from packages, not from us. */
const NOT_OURS = /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$|(^|\/)generated\//;

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
  {
    pattern: new RegExp(`\\b(?:${PRODUCTS.join('|')})\\b`, 'i'),
    reason: 'names another product',
    skip: new RegExp(`${PRO_ONLY.source}|${NOT_OURS.source}`),
    strip: [SOCIAL_CARD_KEY],
  },
  {
    pattern: new RegExp(`\\b(?:${CASED_PRODUCTS.join('|')})\\b|(?<=[a-z,;] )${TEAM_CHAT}\\b`),
    reason: 'names another product',
    skip: new RegExp(`${PRO_ONLY.source}|${NOT_OURS.source}`),
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
        const checked = strip.reduce((text, allowed) => text.replaceAll(allowed, ''), line);
        const problem = `${file}:${index + 1} ${reason}: ${line.trim()}`;
        if (pattern.test(checked) && problems.at(-1) !== problem) problems.push(problem);
      }
    });
}

if (problems.length > 0) {
  console.error(`check-traces failed:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`check-traces passed (${files.length} files).`);
