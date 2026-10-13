import { mediaGridTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { MediaGridViewer } from '../../examples/media-grid/media-grid-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** MediaGrid page body: purpose, example, behaviour, accessibility and tokens. */
export async function MediaGridBody() {
  const source = await readExampleSource('media-grid/media-grid-viewer.tsx');
  const html = await highlightSource(source);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Square photo tiles: a row that scrolls sideways on compact windows and a grid from medium
          windows up, such as a profile&apos;s photos or a listing&apos;s gallery. Pressing a tile
          tells the app which, so it can open {code('MediaViewer')} there with what it wants around
          it. It is <strong className="text-on-surface">not an M3 component</strong>, so it comes
          from {code('@windmorph/react-pro')}.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="A profile’s photos with the viewer"
          code={source}
          html={html}
          fileName="media-grid-viewer.tsx"
        >
          <MediaGridViewer />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Behaviour</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            {code('max')} caps the tiles shown; {code('columns')} sets the grid from medium up (3).
          </li>
          <li>
            On compact windows the row scrolls with snap points; from medium up the grid&apos;s
            outer corners are rounded and inner corners square.
          </li>
          <li>Images load lazily and fill their square tiles.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The list is named by {code('aria-label')} and is focusable, so keyboards can scroll the
            compact row (WCAG 2.1.1).
          </li>
          <li>
            Each tile is a button named by its photo&apos;s {code('alt')}, with the state layer and
            an inset focus ring.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming &amp; tokens</h2>
        <p className="text-body-large text-on-surface-variant">
          Set the tokens below on a grid or any ancestor. Style the parts with {code('classNames')}{' '}
          ({code('root')}, {code('item')}, {code('tile')}, {code('image')}).
        </p>
        <TokenTable set={mediaGridTokenSet} caption="Media grid tokens" />
      </section>
    </>
  );
}
