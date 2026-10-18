'use client';

import { IconButton } from '@windmorph/react';
import { ContentCopyIcon } from './icons';
import { useCopy } from './site-snackbar';

/**
 * The import statement for a component page, under its title: one line of code in a quiet
 * `surface-container` box with a copy button, which confirms in the site snackbar. On a
 * phone the names wrap between them. The names and entry come from `lib/import-line.ts`.
 */
export function ImportLine({ names, entry }: { names: readonly string[]; entry: string }) {
  const copy = useCopy('Import copied');
  const line = `import { ${names.join(', ')} } from '${entry}';`;
  return (
    <div
      data-import-line
      className="flex min-w-0 items-center gap-1 rounded-corner-medium bg-surface-container ps-4"
    >
      <code
        dir="ltr"
        className="min-w-0 flex-1 py-2.5 font-mono text-body-medium text-on-surface-variant break-words"
      >
        <span className="text-tertiary">import</span> {'{ '}
        {names.map((name, index) => (
          <span key={name}>
            <span className="text-on-surface">{name}</span>
            {index < names.length - 1 ? ', ' : ''}
          </span>
        ))}
        {' } '}
        <span className="text-tertiary">from</span>{' '}
        <span className="text-primary">&apos;{entry}&apos;</span>;
      </code>
      <IconButton
        variant="standard"
        size="sm"
        icon={<ContentCopyIcon />}
        aria-label="Copy import"
        onPress={() => void copy(line)}
        className="shrink-0 self-start"
      />
    </div>
  );
}
