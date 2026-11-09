import type { Metadata } from 'next';
import { BlockPreview } from '../../../../components/block-preview';
import { ExampleViewer } from '../../../../components/example-viewer';
import { InlineCode } from '../../../../components/inline-code';
import { readExampleSource } from '../../../../lib/example-source';
import { highlightSource } from '../../../../lib/highlight';
import { guideMetadata } from '../../../../lib/site-metadata';

export const metadata: Metadata = guideMetadata('/blocks/app-frame');

const VARIATIONS = [
  {
    id: 'public',
    title: 'Public',
    file: 'app-frame-public',
    summary: 'A top bar and a flat, full-width page, for pages anyone can see.',
  },
  {
    id: 'app',
    title: 'App',
    file: 'app-frame-app',
    summary: 'Adds a rail with flyouts, and the page becomes a rounded pane.',
  },
  {
    id: 'full',
    title: 'Full',
    file: 'app-frame-full',
    summary: 'Adds a side panel rail, whose item opens a standard side sheet beside the pane.',
  },
  {
    id: 'pinned',
    title: 'Pinned second nav',
    file: 'app-frame-pinned',
    summary:
      'The current section’s links stay open beside the page. Click between pages with and without them.',
  },
] as const;

/** The app frame block: three variations of one layout, each live and copyable. */
export default async function AppFramePage() {
  const items = await Promise.all(
    VARIATIONS.map(async (variation) => {
      const code = await readExampleSource(`blocks/${variation.file}.tsx`);
      return { ...variation, code, html: (await highlightSource(code))! };
    }),
  );
  return (
    <article className="mx-auto flex max-w-5xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">App frame</h1>
        <p className="text-body-large text-on-surface-variant">
          One layout with pieces left out. Copy the variation you need; the code is yours to change.
          The gap around the pane is <InlineCode>--app-frame-gap</InlineCode>, and on a phone the
          page is flat and the rail becomes a drawer.
        </p>
      </header>
      {items.map((item) => (
        <section key={item.id} className="flex flex-col gap-3">
          <h2 id={item.id} className="text-headline-small text-on-surface">
            {item.title}
          </h2>
          <p className="text-body-large text-on-surface-variant">{item.summary}</p>
          <ExampleViewer code={item.code} html={item.html} fileName={`${item.file}.tsx`} tabbed>
            <BlockPreview variation={item.file} title={item.title} />
          </ExampleViewer>
        </section>
      ))}
    </article>
  );
}
