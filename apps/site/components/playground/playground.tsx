'use client';

import { BottomSheet, Button, SheetTrigger } from '@windmorph/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PropsRecord } from '../../lib/component-props';
import { DisplaySettingsButton } from '../../app/(docs)/display-settings';
import { TuneIcon } from '../icons';
import { CodeView } from './code-view';
import { ControlGroups } from './controls';
import { PLAYGROUND_DESCRIPTORS } from './descriptors';
import {
  activeComponent,
  initialValues,
  playgroundControls,
  playgroundSnippet,
} from './playground-state';
import { decodeState, encodeState } from './url-state';

export interface PlaygroundProps {
  /** The page slug, used to resolve the descriptor. */
  slug: string;
  /** The display name whose generated props JSON drives the controls. */
  componentName: string;
  /**
   * The generated props JSON records of the page's documented components, by name: those of
   * `componentName`, and of any sibling the descriptor's `componentSwitch` renders.
   */
  componentProps: Record<string, PropsRecord[]>;
}

/**
 * A live component Playground: a preview, controls inferred from the generated props JSON
 * (plus a per-slug descriptor) in sections (Appearance, Content, Behaviour, Advanced), and a
 * copy-ready code snippet whose changed lines are marked. A wide playground keeps the preview
 * and code in view beside the controls; a narrow one stacks them, and on a phone the controls
 * open in a modal bottom sheet from an "Edit props" button under the preview. The header's
 * settings button opens the site's display settings, to try the component in another theme,
 * mode, contrast or direction. Copying confirms in the site snackbar. State is encoded in
 * discrete URL query keys so a configuration is shareable.
 */
export function Playground({ slug, componentName, componentProps }: PlaygroundProps) {
  const descriptor = PLAYGROUND_DESCRIPTORS[slug];
  const previewRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Changed lines are marked once a control has changed something, not on a restore.
  const [markChanges, setMarkChanges] = useState(false);
  // The phone's sheet covers the lower half: the preview moves to the top first, so the
  // change each control makes stays in view above the sheet.
  const openSheet = (open: boolean) => {
    if (open) previewRef.current?.scrollIntoView({ block: 'start' });
    setSheetOpen(open);
  };

  const initial = useMemo(() => (descriptor ? initialValues(descriptor) : {}), [descriptor]);
  const [values, setValues] = useState<Record<string, unknown>>(initial);

  const active = descriptor ? activeComponent(descriptor, values) : componentName;
  // The URL holds any sibling's values; the panel shows the chosen component's controls.
  const urlControls = useMemo(
    () =>
      descriptor ? playgroundControls(descriptor, componentProps, descriptor.component, true) : [],
    [descriptor, componentProps],
  );
  const controls = useMemo(
    () => (descriptor ? playgroundControls(descriptor, componentProps, active) : []),
    [descriptor, componentProps, active],
  );
  // Values the preview set itself (an overlay opening or closing): live state, not a shared
  // configuration, so they stay out of the URL.
  const [fromPreview, setFromPreviewNames] = useState<ReadonlySet<string>>(() => new Set());
  // Whether the state has changed here since it was last read from the URL.
  const [syncUrl, setSyncUrl] = useState(false);

  // Restore shared state from the URL on mount, and again when the browser's back or forward
  // lands on this page with another query: a one-way sync from the external URL into state
  // (not an SSR-render read, so it stays hydration-safe for the static export).
  useEffect(() => {
    if (!descriptor) return;
    const restore = () => {
      const decoded = decodeState(new URLSearchParams(window.location.search), urlControls);
      // A shared URL can hold any combination, so each restored value is adjusted in turn.
      setValues(
        Object.keys(decoded).reduce(
          (next, name) => (descriptor.adjust ? descriptor.adjust(next, name) : next),
          { ...initial, ...decoded },
        ),
      );
      setFromPreviewNames(new Set());
      setSyncUrl(false);
      setMarkChanges(false);
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [descriptor, urlControls, initial]);

  // Reflect a change made here in the URL by replacing the history entry: no new entry and
  // no page change, so the page never transitions and the back button still leaves the page.
  // A state read from the URL isn't written back, so the URL stays the source until then.
  useEffect(() => {
    if (!descriptor || !syncUrl) return;
    // Only what differs from the starting state goes in the URL, so a fresh page keeps a clean one.
    const changed = Object.fromEntries(
      Object.entries(values).filter(
        ([name, value]) => value !== initial[name] && !fromPreview.has(name),
      ),
    );
    const query = encodeState(changed, urlControls);
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, '', url);
    }
  }, [syncUrl, values, urlControls, descriptor, initial, fromPreview]);

  if (!descriptor) return null;

  const snippet = playgroundSnippet(descriptor, componentProps, values, controls);

  const set = (name: string, value: unknown) =>
    setValues((prev) => (prev[name] === value ? prev : { ...prev, [name]: value }));
  const markPreview = (name: string, isPreview: boolean) =>
    setFromPreviewNames((prev) => {
      if (prev.has(name) === isPreview) return prev;
      const next = new Set(prev);
      if (isPreview) next.add(name);
      else next.delete(name);
      return next;
    });
  const setFromControl = (name: string, value: unknown) => {
    setSyncUrl(true);
    markPreview(name, false);
    setValues((prev) => {
      if (prev[name] === value) return prev;
      const next = { ...prev, [name]: value };
      return descriptor.adjust ? descriptor.adjust(next, name) : next;
    });
  };
  const setFromPreview = (name: string, value: unknown) => {
    setSyncUrl(true);
    markPreview(name, true);
    set(name, value);
  };

  const reset = () => {
    setSyncUrl(true);
    setMarkChanges(true);
    setValues(initial);
  };
  const changeControl = (name: string, value: unknown) => {
    setMarkChanges(true);
    setFromControl(name, value);
  };
  const panelHeader = (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-title-small text-on-surface-variant">Props</h3>
      <Button variant="text" size="sm" onPress={reset}>
        Reset
      </Button>
    </div>
  );
  const controlGroups = (
    <ControlGroups controls={controls} slug={slug} values={values} onChange={changeControl} />
  );

  return (
    // Interactive only, so the Markdown version of the page leaves it out.
    <section
      className="@container/playground flex flex-col gap-4"
      aria-label={`${componentName} playground`}
      data-markdown="skip"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="playground" className="text-headline-small text-on-surface">
          Playground
        </h2>
        <DisplaySettingsButton />
      </div>
      {/*
       * One tinted surface. Wide (a 640px+ playground): the preview and the code share a
       * column that stays in view (sticky under the top bar) beside the controls, which take
       * 40% and grow with their content. Narrow: the preview, then the controls (or, on a
       * phone, an "Edit props" button that opens them in a modal bottom sheet), then the
       * code. Gestures here never swipe the tabs.
       */}
      <div
        onPointerDown={(event) => event.stopPropagation()}
        className="flex flex-col gap-4 rounded-corner-large bg-surface-container-low p-4 @min-[640px]/playground:grid @min-[640px]/playground:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] @min-[640px]/playground:items-start @min-[640px]/playground:gap-6"
      >
        <div
          data-playground-stage=""
          className="contents @min-[640px]/playground:sticky @min-[640px]/playground:top-20 @min-[640px]/playground:flex @min-[640px]/playground:max-h-[calc(100dvh-6rem)] @min-[640px]/playground:flex-col @min-[640px]/playground:gap-4"
        >
          <div
            ref={previewRef}
            data-playground-preview=""
            className="flex min-h-60 shrink-0 scroll-mt-20 flex-wrap items-center justify-center gap-4 rounded-corner-large bg-surface p-6 @min-[640px]/playground:min-h-72"
          >
            {descriptor.render(values, setFromPreview)}
          </div>
          <div className="medium:hidden">
            <SheetTrigger open={sheetOpen} onOpenChange={openSheet}>
              <Button variant="tonal" leadingIcon={<TuneIcon />} className="w-full">
                Edit props
              </Button>
              <BottomSheet aria-label={`${componentName} props`}>
                <div className="flex flex-col gap-2 px-4 pb-6">
                  {panelHeader}
                  {controlGroups}
                </div>
              </BottomSheet>
            </SheetTrigger>
          </div>
          <div className="order-last flex min-h-0 flex-col @min-[640px]/playground:order-none @min-[640px]/playground:flex-1">
            <CodeView code={snippet} markChanges={markChanges} />
          </div>
        </div>
        <div
          data-playground-controls=""
          className="hidden min-w-0 flex-col gap-2 medium:flex"
          aria-label={`${componentName} props`}
          role="group"
        >
          {panelHeader}
          {controlGroups}
        </div>
      </div>
    </section>
  );
}
