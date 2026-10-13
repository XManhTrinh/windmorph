'use client';

import { IconButton, Tab, Tabs } from '@windmorph/react';
import { CodeBlock } from '@windmorph/react-pro';
import { useState, type ReactNode } from 'react';
import { CheckIcon, CodeToggleIcon, ContentCopyIcon } from './icons';

export interface ExampleViewerProps {
  /** Optional heading shown above the example. */
  title?: string;
  /** The live preview — a rendered instance of the example component. */
  children: ReactNode;
  /** Raw example source, copied by the header button and shown in the source block. */
  code: string;
  /** Build-time Shiki markup for `code` (from `highlightSource`). */
  html: string;
  /** @default "tsx" */
  lang?: string;
  /** File name shown in the `CodeBlock` header, e.g. `button-variants.tsx`. */
  fileName?: string;
  /**
   * Shows the preview and the source in `Preview` / `Code` tabs instead of a card with a
   * view-source toggle. Use where a single demo would otherwise take a lot of vertical
   * space. @default false
   */
  tabbed?: boolean;
  /** Whether the source starts expanded in card mode. @default false */
  defaultOpen?: boolean;
}

/**
 * A documentation example viewer. In the default card mode each example sits in its own
 * surface with a title, a top-right copy button and a `<>` view-source toggle (collapsed by
 * default); the inner `CodeBlock` is rendered `copyable={false}` so there is exactly one
 * copy control per card. In `tabbed` mode the preview and source sit in `Preview` / `Code`
 * tabs (the `CodeBlock` keeps its own copy button). Composed only from `@windmorph/react`
 * (`Tabs`, `Tab`, `IconButton`), `@windmorph/react-pro` (`CodeBlock`) and semantic-token markup.
 */
export function ExampleViewer({
  title,
  children,
  code,
  html,
  lang = 'tsx',
  fileName,
  tabbed = false,
  defaultOpen = false,
}: ExampleViewerProps) {
  const [showSource, setShowSource] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const preview = (
    <div className="flex flex-wrap items-center gap-4 rounded-corner-large border border-outline-variant bg-surface p-4">
      {children}
    </div>
  );

  if (tabbed) {
    return (
      <div className="flex flex-col gap-3">
        {title != null && <h3 className="text-title-medium text-on-surface">{title}</h3>}
        <Tabs aria-label={title ? `${title} example` : 'Example'}>
          <Tab key="preview" title="Preview">
            <div className="pt-4">{preview}</div>
          </Tab>
          <Tab key="code" title="Code">
            <div className="pt-4">
              <CodeBlock code={code} html={html} lang={lang} title={fileName} />
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (insecure context); fail quietly.
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-corner-large border border-outline-variant bg-surface-container-low p-4">
      <div className="flex items-center justify-between gap-2">
        {title != null ? (
          <h3 className="text-title-medium text-on-surface">{title}</h3>
        ) : (
          <span aria-hidden="true" />
        )}
        <div className="flex items-center gap-1">
          <IconButton
            size="xs"
            variant="standard"
            icon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            aria-label={copied ? 'Copied' : 'Copy code'}
            onPress={copy}
          />
          <IconButton
            size="xs"
            variant="standard"
            icon={<CodeToggleIcon />}
            aria-label={showSource ? 'Hide source' : 'View source'}
            aria-expanded={showSource}
            onPress={() => setShowSource((value) => !value)}
          />
        </div>
      </div>
      {preview}
      {showSource && (
        <CodeBlock code={code} html={html} lang={lang} title={fileName} copyable={false} />
      )}
    </div>
  );
}
