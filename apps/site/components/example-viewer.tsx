'use client';

import { Button, IconButton, Tab, Tabs, cn } from '@windmorph/react';
import { CodeBlock, Collapse } from '@windmorph/react-pro';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { exampleAnchor } from '../lib/example-anchor';
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
  /**
   * File name shown in the `CodeBlock` header, e.g. `button-variants.tsx`. It also gives the
   * example its anchor (`#example-button-variants`), which the spec status links to.
   */
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
 * The boxes whose size decides whether `root`'s content is wider than it: `root` and its
 * children, passing through wrappers without a box (`display: contents`, as each live
 * example's own wrapper).
 */
function layoutBoxes(root: Element): Element[] {
  const boxes = [root];
  const visit = (parent: Element) => {
    for (const child of parent.children) {
      if (getComputedStyle(child).display === 'contents') visit(child);
      else boxes.push(child);
    }
  };
  visit(root);
  return boxes;
}

/**
 * Whether `element`'s content is wider than its box, so it scrolls sideways. Measured once a
 * frame at most: when it or one of its boxes resizes, and when the content changes (a live
 * example loads after the page, a button group moves items into its overflow menu). Always
 * `false` on the server and before the first measure.
 */
function useOverflowsInline(element: HTMLElement | null): boolean {
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') return;
    let frame = 0;
    const measure = () => {
      // One pending measure at a time, so content that changes every frame (an animation)
      // still gets measured instead of pushing the measure back forever.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setOverflows(element.scrollWidth > element.clientWidth + 1);
      });
    };
    const resize = new ResizeObserver(measure);
    const observeBoxes = () => {
      resize.disconnect();
      for (const box of layoutBoxes(element)) resize.observe(box);
    };
    const mutations = new MutationObserver((records) => {
      if (records.some((record) => record.type === 'childList')) observeBoxes();
      measure();
    });
    mutations.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
    observeBoxes();
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
    };
  }, [element]);
  return overflows;
}

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
  const anchor = fileName ? exampleAnchor(fileName) : undefined;

  useEffect(() => () => clearTimeout(timer.current), []);

  // A state, not a ref: in `tabbed` mode the preview mounts with its tab panel, after this.
  const [previewElement, setPreviewElement] = useState<HTMLDivElement | null>(null);
  const overflows = useOverflowsInline(previewElement);
  // Whether the preview itself has focus. It stays a tab stop until it loses focus: dropping
  // its `tabIndex` while focused (a phone turned sideways, so it stops scrolling) would send
  // focus to the page.
  const [previewFocused, setPreviewFocused] = useState(false);
  const tabStop = overflows || previewFocused;

  // An example wider than a phone's preview (a fixed-size dial, a row of buttons) scrolls
  // sideways inside its box instead of pushing the page sideways (WCAG 1.4.10). Never
  // vertically: `overflow-x: auto` alone makes the other axis `auto` too, and content that
  // overflows only in the scrollable-overflow sense (a touch target 4px past the padding,
  // positioned text that escapes its own scroller) would make the preview a scroller the
  // example scrolls out of sight in. Only while the content is wider than the box, though: any
  // overflow clips both axes, and an example that fits keeps what it draws past the padding
  // (a slider's value label above its thumb). While it scrolls, the preview is a named region
  // in the Tab order, so the keyboard can scroll it too (WCAG 2.1.1), and it stays there until
  // focus leaves it. Its focus indicator is a solid outline: Tailwind's `outline-none` sets the
  // outline style that `outline-2` reads, which drew a 2px outline of style `none`.
  const preview = (
    <div
      ref={setPreviewElement}
      onPointerDown={stopSwipe}
      onFocus={(event) => {
        if (event.target === event.currentTarget) setPreviewFocused(true);
      }}
      onBlur={(event) => {
        if (event.target === event.currentTarget) setPreviewFocused(false);
      }}
      {...(tabStop && {
        role: 'region',
        'aria-label': title ?? 'Example',
        tabIndex: 0,
      })}
      data-overflows={overflows || undefined}
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-4 rounded-corner-large',
        overflows && 'overflow-x-auto overflow-y-hidden',
        'bg-surface-container-low p-6 outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-secondary',
      )}
    >
      {children}
    </div>
  );

  // The Markdown version of the page shows the example's source file in place of all this.
  const markdownProps = fileName
    ? { 'data-example-file': fileName, 'data-example-lang': lang }
    : {};

  if (tabbed) {
    return (
      <div id={anchor} className="flex scroll-mt-2 flex-col gap-3" {...markdownProps}>
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
    <div id={anchor} className="flex scroll-mt-2 flex-col gap-2" {...markdownProps}>
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
      <Collapse open={showSource} appear={!defaultOpen}>
        <div id={sourceId} onPointerDown={stopSwipe}>
          <CodeBlock code={code} html={html} lang={lang} title={fileName} copyable={false} />
        </div>
      </Collapse>
    </div>
  );
}
