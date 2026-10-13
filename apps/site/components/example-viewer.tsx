'use client';

import { Button, IconButton, Tab, Tabs } from '@windmorph/react';
import { CodeBlock, Collapse } from '@windmorph/react-pro';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { CheckIcon, CodeIcon, ContentCopyIcon } from './icons';
import { useCopy } from './site-snackbar';

export interface ExampleViewerProps {
  /** Optional heading shown above the example. */
  title?: string;
  /** The live preview — a rendered instance of the example component. */
  children: ReactNode;
  /** Raw example source, copied by the copy button and shown in the source block. */
  code: string;
  /** Build-time Shiki markup for `code` (from `highlightSource`). */
  html: string;
  /** @default "tsx" */
  lang?: string;
  /** File name shown in the `CodeBlock` header, e.g. `button-variants.tsx`. */
  fileName?: string;
  /**
   * Shows the preview and the source in `Preview` / `Code` tabs instead of a preview with a
   * "Show code" button. Use where a single demo would otherwise take a lot of vertical
   * space. @default false
   */
  tabbed?: boolean;
  /** Whether the source starts expanded. @default false */
  defaultOpen?: boolean;
}

const COPIED_MS = 2000;

/**
 * Stops a swipe that starts on a live example from reaching the page's swipeable tabs, so
 * sliders, carousels and sheets in a preview keep their own gestures.
 */
function stopSwipe(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

/**
 * A documentation example: a title, the live preview on a quiet tinted surface, and below
 * it a "Show code" text button that unfolds the source with the library's collapse motion,
 * beside a copy button that confirms in the site snackbar. In `tabbed` mode the preview and
 * source sit in `Preview` / `Code` tabs. Composed from `@windmorph/react` (`Button`,
 * `IconButton`, `Tabs`) and `@windmorph/react-pro` (`CodeBlock`, `Collapse`).
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
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = useCopy();
  const sourceId = useId();

  useEffect(() => () => clearTimeout(timer.current), []);

  const preview = (
    <div
      onPointerDown={stopSwipe}
      className="flex flex-wrap items-center gap-4 rounded-corner-large bg-surface-container-low p-6"
    >
      {children}
    </div>
  );

  if (tabbed) {
    return (
      <div className="flex flex-col gap-3">
        {title != null && <h3 className="text-title-medium text-on-surface">{title}</h3>}
        <Tabs aria-label={title ? `${title} example` : 'Example'} variant="secondary">
          <Tab key="preview" title="Preview">
            <div className="pt-4">{preview}</div>
          </Tab>
          <Tab key="code" title="Code">
            <div className="pt-4" onPointerDown={stopSwipe}>
              <CodeBlock code={code} html={html} lang={lang} title={fileName} />
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }

  const onCopy = async () => {
    if (!(await copy(code))) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <div className="flex flex-col gap-2">
      {title != null && <h3 className="text-title-medium text-on-surface">{title}</h3>}
      {preview}
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="text"
          size="sm"
          leadingIcon={<CodeIcon />}
          aria-expanded={showSource}
          aria-controls={showSource ? sourceId : undefined}
          onPress={() => setShowSource((value) => !value)}
        >
          {showSource ? 'Hide code' : 'Show code'}
        </Button>
        <IconButton
          size="sm"
          variant="standard"
          icon={copied ? <CheckIcon /> : <ContentCopyIcon />}
          aria-label={copied ? 'Copied' : 'Copy code'}
          onPress={() => void onCopy()}
        />
      </div>
      <Collapse isOpen={showSource} appear={!defaultOpen}>
        <div id={sourceId} onPointerDown={stopSwipe}>
          <CodeBlock code={code} html={html} lang={lang} title={fileName} copyable={false} />
        </div>
      </Collapse>
    </div>
  );
}
