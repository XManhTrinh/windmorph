import type { ComponentDoc } from './doc';
import { mediaGridTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const MediaGridViewer = lazyExample('media-grid/media-grid-viewer', 'MediaGridViewer');
const MediaGridColumns = lazyExample('media-grid/media-grid-columns', 'MediaGridColumns');

/** MediaGrid page body: purpose, example, behaviour and tokens. */
export async function MediaGridBody(): Promise<ComponentDoc> {
  const source = await readExampleSource('media-grid/media-grid-viewer.tsx');
  const html = await highlightSource(source);

  const columns = await readExampleSource('media-grid/media-grid-columns.tsx');
  const columnsHtml = await highlightSource(columns);
  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="A profile’s photos with the viewer"
            code={source}
            html={html}
            fileName="media-grid-viewer.tsx"
          >
            <MediaGridViewer />
          </ExampleViewer>
          <ExampleViewer
            title="Every photo, in four columns"
            code={columns}
            html={columnsHtml}
            fileName="media-grid-columns.tsx"
          >
            <MediaGridColumns />
          </ExampleViewer>
        </section>
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Square photo tiles: a row that scrolls sideways on compact windows and a grid from
            medium windows up, such as a profile&apos;s photos or a listing&apos;s gallery. Pressing
            a tile tells the app which, and passes the tile, so it can open{' '}
            <InlineCode>MediaViewer</InlineCode> there, growing out of the tile (its{' '}
            <InlineCode>origin</InlineCode>), with what it wants around it. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>max</InlineCode> caps the tiles shown; <InlineCode>columns</InlineCode>{' '}
              sets the grid from medium up (3).
            </li>
            <li>
              On compact windows the row scrolls with snap points; from medium up the grid&apos;s
              outer corners are rounded and inner corners square.
            </li>
            <li>Images load lazily and fill their square tiles.</li>
            <li>
              <InlineCode>onItemPress</InlineCode> gets the pressed tile&apos;s index and the tile
              itself: pass the tile to <InlineCode>MediaViewer</InlineCode>&apos;s{' '}
              <InlineCode>origin</InlineCode> for the M3 container transform.
            </li>
            <li>
              Each tile shows the core&apos;s state layer over its photo (hover, focus) and the
              press ripple. The list is a Tab stop only while the compact row scrolls.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming-and-tokens" className="text-headline-small text-on-surface">
            Theming &amp; tokens
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Set the tokens below on a grid or any ancestor. Style the parts with{' '}
            <InlineCode>classNames</InlineCode> (<InlineCode>root</InlineCode>,{' '}
            <InlineCode>item</InlineCode>, <InlineCode>tile</InlineCode>,{' '}
            <InlineCode>image</InlineCode>).
          </p>
          <TokenTable set={mediaGridTokenSet} caption="Media grid tokens" />
        </section>
      </>
    ),
  };
}
