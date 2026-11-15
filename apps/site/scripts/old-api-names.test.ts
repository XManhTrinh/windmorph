import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * The docs never show a public name the library replaced (the API naming round, 2026-10-17):
 * page text, examples and the playground's descriptors (and the code they write) use today's
 * names. The types catch a renamed prop in compiled code; this catches one in prose, in a
 * snippet string and in a descriptor's prop list, which the compiler can't see.
 */
const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOTS = ['content', 'examples', 'components/playground/descriptors'];

/** Old name → what replaced it. Each is matched as a whole word in code-like positions. */
const REPLACED: Record<string, string> = {
  strings: 'labels',
  minValue: 'min',
  maxValue: 'max',
  dismissable: 'closedBy',
  keyboardDismissDisabled: 'closedBy',
  showValueLabel: 'valueLabel',
  showHeader: 'header',
  showModeToggle: 'modeToggle',
  showCharacterCount: 'counter',
  iconPosition: 'iconPlacement',
  fabPosition: 'fabPlacement',
  closeLabel: 'labels.close',
  menuLabel: 'labels.menu',
  elementType: 'as',
  initialExpanded: 'defaultExpanded',
  initialVisible: 'defaultVisible',
  allowsCustomValue: 'allowCustomValue',
  disallowEmptySelection: 'deselectable',
  shouldCloseOnSelect: 'closeOnSelect',
  shouldFocusWrap: 'nothing: the arrow keys always wrap',
  escapeKeyBehavior: 'nothing: Escape always closes',
  validationState: 'invalid',
  // React Aria's field states, which its inherited descriptions name (`generate-props.ts`).
  isInvalid: 'invalid',
  isRequired: 'required',
  isReadOnly: 'readOnly',
  excludeFromTabOrder: 'tabIndex={-1}',
  selectedKey: 'value',
  defaultSelectedKey: 'defaultValue',
  unselectedIcon: 'uncheckedIcon',
  onValueChange: 'onChange',
  // Replaced in 0.2.9 for the library's consistent names, kept as deprecated aliases.
  heroAlignment: 'heroAlign',
  verticalAlignment: 'verticalAlign',
  itemAlignment: 'itemAlign',
  onDismiss: 'onClose',
  // Windmorph Pro's replaced names (its own API naming round, 2026-10-17).
  tone: 'color (severity on Alert)',
  focusOnMount: 'autoFocus',
  onExited: 'onClosed',
  onItemPress: 'onAction',
  maxIcons: 'max',
  showIdleIcon: 'idleIcon',
  showLineNumbers: 'lineNumbers',
  showCounter: 'counter',
  canSend: 'sendable',
  sendingLabel: 'labels.sending',
  overflowLabel: 'labels.overflow',
  copyButton: 'classNames.copy',
  // Windmorph Pro's replaced names in 0.2.9, kept as deprecated aliases.
  titleAs: 'headingLevel',
  onFiles: 'onFileAccept',
};

/** Patterns for old values and props that are also everyday words. */
const OLD_PATTERNS: [RegExp, string][] = [
  [/\bquick(?==|:\s|`)/, 'instant'],
  [/['"`](?:top|bottom) (?:start|end)['"`]/, 'a hyphenated placement (bottom-start)'],
  [/controlPlacement(?:=|:\s*)['"](?:leading|trailing)['"]/, "controlPlacement 'start' / 'end'"],
  [/<(?:Fab|FabMenu)\b[^>]*\bsize=["'](?:medium|large)["']/, "size 'md' / 'lg'"],
  [/<ListItemVideo\b[^>]*\bsize=["'](?:small|large)["']/, "size 'sm' / 'lg'"],
  [/<Slider\b[^>]*\b(?:startIcon|endIcon)=/, 'leadingIcon / trailingIcon'],
  [/<Switch\b[^>]*\bselectedIcon=/, 'checkedIcon'],
  // 0.2.9: a navigation item marks the current page (`aria-current`), not a selection.
  [/<Navigation(?:Bar|Rail)Item\b[^>]*\bselected(?:Icon)?[\s=/>]/, 'current / currentIcon'],
  [/<(?:TooltipTrigger|RichTooltipTrigger|SubmenuTrigger)\b[^>]*\bdelay=/, 'openDelay'],
  // Windmorph Pro. `submitting` and `busy` are also everyday words (and search keywords), so
  // only a prop, an object key or a code span counts, and `aria-busy` never does.
  [/(?<![-\w])(?:submitting|busy)(?:=|:\s)|`(?:submitting|busy)`|labels\.busy/, 'pending'],
  [
    /\b(?:avatarShapes|TAG_TONES|TagTone|AVATAR_TONE_SLOTS)\b/,
    'the shape constants, TAG_COLORS, TagColor, AVATAR_COLOR_SLOTS',
  ],
  [/\bdata-tone\b/, 'data-color (data-severity on Alert)'],
  [/<(?:PinInput|Link)\b[^>]*\bsize=["'](?:small|medium|large)["']/, "size 'sm' / 'md' / 'lg'"],
  [/<Tag\b[^>]*\bshape=["'](?:full|rounded)["']/, "shape 'round' / 'square'"],
  [/\bshape=["'][A-Z]\w*["']/, 'a shape constant (shape={cookie9SidedShape})'],
  [/materialShapeMask\(\s*['"]/, 'a shape constant (materialShapeMask(cookie9SidedShape))'],
  [/<AvatarGroup\b[^>]*(?<![-\w])label=/, 'aria-label'],
  [/<(?:MessageField|RichMessageField|MessageFieldFrame)\b[^>]*\bdescription=/, 'supportingText'],
  [/`supporting`|\bsupporting:\s/, 'classNames.supportingText'],
  [
    /--wm-avatar-(?:on-)?tone-|--wm-tag-rounded-corner|--wm-message-field-supporting(?!-text)/,
    'the renamed tokens (--wm-avatar-color-N, --wm-tag-square-corner, --wm-message-field-supporting-text)',
  ],
];

/**
 * Names replaced on some components only, checked in those components' pages and examples:
 * checkboxes and switches are `checked` (2026-10-17), while toggles and chips keep `selected`.
 */
const SCOPED: [RegExp, Record<string, string>][] = [
  [
    /(?:^|\/)(?:checkbox|switch)(?:[-./]|$)/,
    { selected: 'checked', defaultSelected: 'defaultChecked', onSelectedChange: 'onCheckedChange' },
  ],
  // Windmorph Pro's 0.2.9 names, where the old one is also an everyday word.
  [/(?:^|\/)file-trigger(?:[-./]|$)/, { onSelect: 'onFileAccept' }],
  [/(?:^|\/)media-upload-grid(?:[-./]|$)/, { onAdd: 'onFileAccept' }],
];

/**
 * Old props whose names are also a status value, a `labels` key or a `classNames` key that
 * stayed (LoadMore's `'loading'` status and `labels.loading`, NavigationRailGroup's `heading`
 * slot): only the JSX attribute counts, in those components' pages and examples.
 */
const SCOPED_PATTERNS: [RegExp, RegExp, string][] = [
  [/(?:^|\/)load-more(?:[-./]|$)/, /\b(?:loading|end)=\{/, 'loadingIndicator / endMessage'],
  [/(?:^|\/)popover(?:[-./]|$)/, /\bheadline=/, 'title'],
  [/(?:^|\/)(?:navigation-rail-group|blocks)(?:[-./]|$)/, /\bheading=/, 'title'],
];

/** A name used as code: a JSX attribute, an object key, a code span or a quoted string. */
const asCode = (name: string) => new RegExp(`(?:\\b${name}(?==|\\?*:\\s)|[\`'"]${name}[\`'".])`);

function files(dir: string): string[] {
  return readdirSync(join(site, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(tsx?|mdx)$/.test(entry.name))
    .filter((entry) => !/\.test\.tsx?$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name));
}

/** Compose's own parameter names, which the "From Compose" mappings quote on purpose. */
const withoutCompose = (line: string) => line.replace(/compose:\s*'[^']*'/g, '');

function findings(): string[] {
  const found: string[] = [];
  for (const root of ROOTS) {
    for (const file of files(root)) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((raw, index) => {
        const line = withoutCompose(raw);
        const where = `${relative(site, file)}:${index + 1}`;
        for (const [name, now] of Object.entries(REPLACED)) {
          if (asCode(name).test(line)) found.push(`${where} ${name} (now ${now})`);
        }
        for (const [pattern, now] of OLD_PATTERNS) {
          if (pattern.test(line)) found.push(`${where} ${pattern.source} (now ${now})`);
        }
        for (const [scope, pattern, now] of SCOPED_PATTERNS) {
          if (scope.test(relative(site, file)) && pattern.test(line)) {
            found.push(`${where} ${pattern.source} (now ${now})`);
          }
        }
        for (const [scope, replaced] of SCOPED) {
          if (!scope.test(relative(site, file))) continue;
          for (const [name, now] of Object.entries(replaced)) {
            if (asCode(name).test(line)) found.push(`${where} ${name} (now ${now})`);
          }
        }
      });
    }
  }
  return found;
}

describe('old public names in the docs', () => {
  it('finds the files it scans', () => {
    expect(ROOTS.flatMap(files).length).toBeGreaterThan(300);
  });

  it('shows none of the names the library replaced', () => {
    expect(findings()).toEqual([]);
  });
});
