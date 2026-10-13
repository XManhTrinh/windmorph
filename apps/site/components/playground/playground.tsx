'use client';

import { Button, IconButton, SnackbarHost, useSnackbarHostState } from '@windmorph/react';
import { CodeBlock } from '@windmorph/react-pro';
import { useEffect, useMemo, useState } from 'react';
import type { PropsRecord } from '../../lib/component-props';
import { ContentCopyIcon } from '../icons';
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
 * A live component Playground: a preview, a panel of controls inferred from the generated
 * props JSON (plus a per-slug descriptor), and a copy-ready code snippet. The code block is
 * rendered `copyable={false}` with a site-owned copy button that writes to the clipboard and
 * shows an in-island snackbar toast. State is encoded in discrete URL query keys so a
 * configuration is shareable. A client island (`componentName` unused for rendering is kept
 * for the heading/aria context).
 */
export function Playground({ slug, componentName, props }: PlaygroundProps) {
  const descriptor = PLAYGROUND_DESCRIPTORS[slug];
  const snackbar = useSnackbarHostState();

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

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      snackbar.showSnackbar({ message: 'Copied to clipboard', withDismissAction: true });
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[playground] clipboard write failed');
      }
    }
  }

  const set = (name: string, value: unknown) => setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <section className="flex flex-col gap-4" aria-label={`${componentName} playground`}>
      <h2 className="text-headline-small text-on-surface">Playground</h2>
      {/*
       * One cohesive card: the preview + props panel and the code panel are sections of the
       * same bordered surface, split by a divider, so the whole Playground reads as a single
       * component. The two panel headers ("Props", "Code") share one style.
       */}
      <div className="relative overflow-hidden rounded-corner-large border border-outline-variant bg-surface-container-low">
        <div className="grid gap-4 p-4 large:grid-cols-[1fr_280px]">
          <div className="flex min-h-[180px] flex-wrap items-center justify-center gap-4 rounded-corner-large bg-surface p-6">
            {descriptor.render(values)}
          </div>
          <div className="flex min-w-0 flex-col gap-4">
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
          </div>
        </div>

        <div className="h-px bg-outline-variant" aria-hidden="true" />

        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-title-small text-on-surface-variant">Code</h3>
            <IconButton
              size="xs"
              variant="standard"
              icon={<ContentCopyIcon />}
              aria-label="Copy code"
              onPress={copy}
            />
          </div>
          <CodeBlock code={snippet} lang="tsx" copyable={false} />
        </div>
        <SnackbarHost state={snackbar} className="absolute inset-x-0 bottom-0" />
      </div>
    </section>
  );
}
