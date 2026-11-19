// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/*
 * Every icon slot sizes its icon with one rule: a bare `svg`, or a single child that holds an
 * `svg` directly (an app's wrapper, such as an icon with a mark on its corner), takes the
 * slot's size. Any other single child (a `BadgedBox`, a letter, an emoji) keeps its own.
 * This reads the sources: each class string that sizes `[&>svg]` must size the wrapper the
 * same way, so a new slot without it fails here.
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const SOURCE = /\.tsx?$/;

/**
 * Slots left out, each for a reason:
 * - `BadgedBox`'s anchor sizes a bare `svg` to Compose's 24px and leaves an app's wrapper the
 *   size the app gives it (the way to show another size), so its badge hangs from that;
 * - a list item's leading and trailing slots and the search bar's trailing one hold media,
 *   avatars and controls with sizes of their own (a `ListItemImage` whose fallback is an
 *   icon holds an `svg` directly), which a wrapper rule would shrink to the icon's size;
 * - the slots that only ever hold the library's own icon.
 */
const EXEMPT: Record<string, string[]> = {
  'components/badge/badge-styles.ts': [
    'col-start-1 row-start-1 flex items-center justify-center [&>svg]:size-[24px]',
  ],
  'components/search/search-styles.ts': [
    '[&>svg]:size-[24px] [&>img]:size-[30px] [&>img]:rounded-full',
  ],
  // The remove button's close icon, beside its touch target.
  'components/chip/chip-styles.ts': ['state-layer [&>svg]:size-[18px]'],
  // An item's leading and trailing slots; an expandable item's chevron, and a video's play mark.
  'components/list/list-styles.ts': [
    'col-start-1 me-[12px] flex items-center gap-x-[12px] text-title-medium text-[color:var(--_md-comp-list-list-item-leading-icon-color)] [&>svg]:size-[20px]',
    'col-start-3 ms-[12px] flex items-center gap-x-[12px] text-label-small text-[color:var(--_md-comp-list-list-item-trailing-icon-color)] [&>svg]:size-[20px]',
    'state-layer [&>svg]:size-[20px] [&>svg]:fill-current',
    'bg-inverse-surface/70 text-inverse-on-surface [&>svg]:size-[16px] [&>svg]:fill-current',
  ],
  // A submenu sheet's back arrow.
  'components/menu/menu-styles.ts': [
    'state-layer focus-ring text-on-surface-variant [&>svg]:size-[24px]',
  ],
  // The open and clear buttons' own icons, beside their touch targets.
  'components/autocomplete/Autocomplete.tsx': [
    'relative flex size-[40px] items-center justify-center rounded-corner-full outline-none state-layer focus-ring [&>svg]:size-[24px]',
    'relative flex size-[40px] items-center justify-center rounded-corner-full text-on-surface-variant outline-none state-layer [&>svg]:size-[24px]',
  ],
};

const SIZES_SVG = /\[&>svg\]:(?:size-|\[(?:block|inline)-size:)/;
const SVG_SIZE = /\[&>svg\]:(size-[^\s'"`]+|\[(?:block|inline)-size:[^\]]+\])/g;
const LITERAL = /'[^']*'|"[^"]*"|`[^`]*`/g;

function sources(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return SOURCE.test(entry.name) && !entry.name.includes('.test.') ? [path] : [];
  });
}

/** Each class string in the components, composites and primitives, with where it is. */
function classStrings(): { where: string; file: string; text: string }[] {
  return ['components', 'composites', 'primitives'].flatMap((folder) =>
    sources(join(root, folder)).flatMap((path) => {
      const file = path.slice(root.length);
      return readFileSync(path, 'utf8')
        .split('\n')
        .flatMap((line, index) =>
          (line.match(LITERAL) ?? []).map((literal) => ({
            where: `${file}:${index + 1}`,
            file,
            text: literal.slice(1, -1),
          })),
        );
    }),
  );
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('icon slots', () => {
  const strings = classStrings();

  it('every slot that sizes an svg sizes a single wrapper holding one the same way', () => {
    const slots = strings.filter(({ text }) => SIZES_SVG.test(text));
    expect(slots.length).toBeGreaterThan(20);
    const missing = slots.flatMap(({ where, file, text }) => {
      if (EXEMPT[file]?.includes(text)) return [];
      return [...text.matchAll(SVG_SIZE)].flatMap(([, size]) => {
        // An `a` or `button` may be excluded where the slot also takes a control.
        const wrapper = new RegExp(
          `\\[&>:only-child(?::not\\([^)]*\\))?:has\\(>svg\\)\\]:${escape(size!)}(?![\\w\\]-])`,
        );
        return wrapper.test(text) ? [] : [`${where}: ${size}`];
      });
    });
    expect(missing).toEqual([]);
  });

  it('no slot fills a single child that holds no svg', () => {
    const bare = strings.filter(({ text }) => text.includes('[&>:only-child]:'));
    expect(bare.map(({ where }) => where)).toEqual([]);
  });

  it('every exempt slot is still there', () => {
    for (const [file, texts] of Object.entries(EXEMPT)) {
      for (const text of texts) {
        expect(
          strings.some((entry) => entry.file === file && entry.text === text),
          file,
        ).toBe(true);
      }
    }
  });
});
