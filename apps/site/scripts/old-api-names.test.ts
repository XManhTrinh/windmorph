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
// The whole site's source: pages and their shell (`app`), and the home page's and the
// playground's components, as well as the content and examples (2026-11-16).
const ROOTS = ['content', 'examples', 'components', 'app'];

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
 * Replaced names a later component took for something else, with the files where that use is
 * right: StatTile's `change.tone` (`good`, `bad`, `neutral`; 0.2.10) is what a change means, not
 * a colour.
 */
const REUSED: Record<string, RegExp> = {
  tone: /(?:^|\/)(?:stat-tile|charts-figures)(?:[-./]|$)/,
};

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
  // The playground's descriptors of Pro's inputs, FileTrigger's and MediaUploadGrid's among them.
  [/(?:^|\/)descriptors\/inputs-pro\.tsx$/, { onSelect: 'onFileAccept', onAdd: 'onFileAccept' }],
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
  // 0.2.9: a navigation item marks the current page, in prose too ("with `selected`"), except
  // where a page says the old name still works.
  [
    /(?:^|\/)(?:navigation-(?:bar|rail)|bar-|rail-)/,
    /`selected(?:Icon)?`(?!, its name before)/,
    '`current` / `currentIcon`',
  ],
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

/**
 * The JSX element whose `<` is at `start`, up to its tag's own `>`, with whatever sits in
 * braces blanked: its attributes as written, over however many lines, without an arrow's `>`
 * or a nested element's attributes (`icon={<HomeIcon />}`) ending or joining it.
 */
export function elementAt(text: string, start: number): string {
  let depth = 0;
  let quote = '';
  let element = '';
  for (let index = start; index < text.length; index += 1) {
    const char = text[index]!;
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    } else if (depth === 0 && (char === '"' || char === "'")) {
      quote = char;
    } else if (depth === 0 && char === '>') {
      return element + char;
    }
    element += depth > 0 || char === '}' ? ' ' : char;
  }
  return element;
}

/**
 * The patterns that read a JSX element's attributes (`<Tag … attr=`), split into the tag and
 * the attribute and matched element by element, since an element's attributes usually sit on
 * lines of their own (2026-11-16: line by line, they passed).
 */
const ELEMENT_PATTERNS = OLD_PATTERNS.filter(([pattern]) => pattern.source.startsWith('<')).map(
  ([pattern, now]) => {
    const [tag, attribute] = pattern.source.split('[^>]*') as [string, string];
    return {
      tag: new RegExp(tag, 'g'),
      attribute: new RegExp(attribute),
      source: pattern.source,
      now,
    };
  },
);
const LINE_PATTERNS = OLD_PATTERNS.filter(([pattern]) => !pattern.source.startsWith('<'));

function findings(): string[] {
  const found: string[] = [];
  for (const root of ROOTS) {
    for (const file of files(root)) {
      const text = readFileSync(file, 'utf8');
      for (const { tag, attribute, source, now } of ELEMENT_PATTERNS) {
        for (const match of text.matchAll(tag)) {
          if (!attribute.test(elementAt(text, match.index))) continue;
          const line = text.slice(0, match.index).split('\n').length;
          found.push(`${relative(site, file)}:${line} ${source} (now ${now})`);
        }
      }
      const lines = text.split('\n');
      lines.forEach((raw, index) => {
        const line = withoutCompose(raw);
        const where = `${relative(site, file)}:${index + 1}`;
        for (const [name, now] of Object.entries(REPLACED)) {
          if (REUSED[name]?.test(relative(site, file))) continue;
          if (asCode(name).test(line)) found.push(`${where} ${name} (now ${now})`);
        }
        for (const [pattern, now] of LINE_PATTERNS) {
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

  // Line by line, an old attribute on a line of its own, as most of the site's JSX writes it,
  // passed (2026-11-16).
  it("reads an element's attributes over its lines, past nested elements and arrows", () => {
    const source = [
      '<NavigationRailItem',
      '  icon={<HomeIcon />}',
      '  onPress={() => go()}',
      '  selected',
      '/>',
      '<NavigationRailItem icon={<Icon selected />} current />',
    ].join('\n');
    const nav = ELEMENT_PATTERNS.find(({ source: original }) => original.includes('Navigation'))!;
    const hits = [...source.matchAll(nav.tag)].filter((match) =>
      nav.attribute.test(elementAt(source, match.index)),
    );
    expect(hits.map((match) => match.index)).toEqual([0]);
  });

  it('shows none of the names the library replaced', () => {
    expect(findings()).toEqual([]);
  });
});
