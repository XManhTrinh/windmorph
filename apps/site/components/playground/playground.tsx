'use client';

import { BottomSheet, Button, IconButton } from '@windmorph/react';
import { CodeBlock } from '@windmorph/react-pro';
import { useEffect, useMemo, useState } from 'react';
import type { PropsRecord } from '../../lib/component-props';
import { DisplaySettingsButton } from '../../app/(docs)/display-settings';
import { ContentCopyIcon } from '../icons';
import { useCopy } from '../site-snackbar';
import { emitSnippet, propDefaultsFrom } from './code-emit';
import { Control } from './controls';
import { inferControls } from './controls-model';
import { PLAYGROUND_DESCRIPTORS } from './descriptors';
import { decodeState, encodeState } from './url-state';

export interface PlaygroundProps {
  /** The page slug, used to resolve the descriptor. */
  slug: string;
  /** The display name whose generated props JSON drives the controls. */
  componentName: string;
  /** The generated props JSON records for `componentName`. */
  props: PropsRecord[];
}

/**
 * A live component Playground: a preview, controls inferred from the generated props JSON
 * (plus a per-slug descriptor) and a copy-ready code snippet. The controls sit beside the
 * preview on large windows, under it on medium ones and in a peeking standard bottom sheet
 * on compact ones. The header's settings button opens the site's display settings, to try
 * the component in another theme, mode, contrast or direction. Copying confirms in the site
 * snackbar. State is encoded in discrete URL query keys so a configuration is shareable.
 */
export function Playground({ slug, componentName, props }: PlaygroundProps) {
  const descriptor = PLAYGROUND_DESCRIPTORS[slug];
  const copy = useCopy();

  const controls = useMemo(
    () =>
      descriptor
        ? inferControls(
            props,
            descriptor.surfacedProps,
            descriptor.enumOptions,
            descriptor.defaultProps,
          )
        : [],
    [descriptor, props],
  );
  const propDefaults = useMemo(() => propDefaultsFrom(props), [props]);
  const initial = useMemo(
    () => ({ ...(descriptor?.defaultProps ?? {}), ...(descriptor?.initialState ?? {}) }),
    [descriptor],
  );
  const [values, setValues] = useState<Record<string, unknown>>(initial);

  // Restore shared state from the URL once on mount — a one-way sync from the external URL
  // into state (not an SSR-render read, so it stays hydration-safe for the static export).
  useEffect(() => {
    if (!descriptor) return;
    const decoded = decodeState(new URLSearchParams(window.location.search), controls);
    if (Object.keys(decoded).length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues((prev) => ({ ...prev, ...decoded }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect state in the URL without navigating.
  useEffect(() => {
    if (!descriptor) return;
    const query = encodeState(values, controls);
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [values, controls, descriptor]);

  if (!descriptor) return null;

  const snippet = emitSnippet({
    component: descriptor.component,
    values,
    surfacedProps: descriptor.surfacedProps,
    defaultProps: descriptor.defaultProps,
    propDefaults,
    importMembers: descriptor.importMembers,
    codeImports: descriptor.codeImports,
    codeSlots: descriptor.codeSlots,
    codeChildren: descriptor.codeChildren,
    importFrom: descriptor.importFrom,
  });

  const set = (name: string, value: unknown) => setValues((prev) => ({ ...prev, [name]: value }));

  const controlsPanel = (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-title-small text-on-surface-variant">Props</h3>
        <Button variant="text" size="xs" onPress={() => setValues(initial)}>
          Reset
        </Button>
      </div>
      {controls.map((def) => (
        <Control
          key={def.name}
          def={def}
          value={values[def.name]}
          onChange={(value) => set(def.name, value)}
        />
      ))}
    </>
  );

  return (
    <section className="flex flex-col gap-4" aria-label={`${componentName} playground`}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="playground" className="text-headline-small text-on-surface">
          Playground
        </h2>
        <DisplaySettingsButton />
      </div>
      {/*
       * One tinted surface: the preview with the controls beside it (large windows) or under
       * it (medium), then the code. On compact windows the controls move into a standard
       * bottom sheet that peeks at the bottom of the card and expands over the code, so the
       * preview stays in view while the props change. Gestures here never swipe the tabs.
       */}
      <div
        onPointerDown={(event) => event.stopPropagation()}
        className="relative overflow-hidden rounded-corner-large bg-surface-container-low"
      >
        <div className="grid gap-4 p-4 large:grid-cols-[1fr_280px]">
          <div className="flex min-h-[240px] flex-wrap items-center justify-center gap-4 rounded-corner-large bg-surface p-6">
            {descriptor.render(values)}
          </div>
          <div className="hidden min-w-0 flex-col gap-4 medium:flex">{controlsPanel}</div>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-title-small text-on-surface-variant">Code</h3>
            <IconButton
              size="sm"
              variant="standard"
              icon={<ContentCopyIcon />}
              aria-label="Copy code"
              onPress={() => void copy(snippet)}
            />
          </div>
          <CodeBlock code={snippet} lang="tsx" copyable={false} />
        </div>

        {/* Room for the peeking sheet, so it never covers the code at rest. */}
        <div aria-hidden="true" className="h-24 medium:hidden" />
        <BottomSheet
          variant="standard"
          // The handle and the "Props" row show while it rests.
          peekHeight={96}
          aria-label={`${componentName} props`}
          classNames={{ container: 'absolute medium:hidden' }}
        >
          <div className="flex max-h-[240px] flex-col gap-4 overflow-y-auto px-4 pb-4">
            {controlsPanel}
          </div>
        </BottomSheet>
      </div>
    </section>
  );
}
