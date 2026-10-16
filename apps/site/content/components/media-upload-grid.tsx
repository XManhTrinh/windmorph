import type { ComponentDoc } from './doc';
import { mediaUploadGridTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const MediaUploadGridComposer = lazyExample(
  'media-upload-grid/media-upload-grid-composer',
  'MediaUploadGridComposer',
);
const MediaUploadGridDisabled = lazyExample(
  'media-upload-grid/media-upload-grid-disabled',
  'MediaUploadGridDisabled',
);
const MediaUploadGridRow = lazyExample(
  'media-upload-grid/media-upload-grid-row',
  'MediaUploadGridRow',
);

/** Media upload grid page body: purpose, examples, the app's part and theming. */
export async function MediaUploadGridBody(): Promise<ComponentDoc> {
  const [composer, row, disabled] = await Promise.all([
    readExampleSource('media-upload-grid/media-upload-grid-composer.tsx'),
    readExampleSource('media-upload-grid/media-upload-grid-row.tsx'),
    readExampleSource('media-upload-grid/media-upload-grid-disabled.tsx'),
  ]);
  const [composerHtml, rowHtml, disabledHtml] = await Promise.all([
    highlightSource(composer),
    highlightSource(row),
    highlightSource(disabled),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="A post composer: progress, retry, reorder and a menu"
            code={composer}
            html={composerHtml}
            fileName="media-upload-grid-composer.tsx"
          >
            <MediaUploadGridComposer />
          </ExampleViewer>
          <ExampleViewer
            title="One scrolling row"
            code={row}
            html={rowHtml}
            fileName="media-upload-grid-row.tsx"
          >
            <MediaUploadGridRow />
          </ExampleViewer>
          <ExampleViewer
            title="Disabled while the post is sent"
            code={disabled}
            html={disabledHtml}
            fileName="media-upload-grid-disabled.tsx"
          >
            <MediaUploadGridDisabled />
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
            The photos someone is adding to a post, listing or product: a square thumbnail for each,
            with its upload progress or the reason it failed, a remove button, an optional menu, and
            an &quot;Add photos&quot; tile. Files dropped on the grid are added too, and photos
            reorder by dragging. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>: it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>, built on React Aria&apos;s grid list drag
            and drop and the library&apos;s File trigger, Icon buttons, Menu and progress
            indicators.
          </p>
          <p className="text-body-large text-on-surface-variant">
            A grid fills its container&apos;s width with 3 columns, 4 from 600px and 5 from 840px
            (the grid&apos;s own width, so it fits a dialog as well as a page);{' '}
            <InlineCode>{'layout="row"'}</InlineCode> is one scrolling row of 112px tiles. Below
            280px the grid drops to 2 columns, so tiles stay 88px or more and their corner
            buttons&apos; touch targets never overlap.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="the-apps-part" className="text-headline-small text-on-surface">
            The app&apos;s part
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The grid keeps nothing: the app holds the photos in <InlineCode>items</InlineCode> and
              changes them in the callbacks. <InlineCode>onAdd(files)</InlineCode> gets only files
              matching <InlineCode>accept</InlineCode>, and no more than fit under{' '}
              <InlineCode>maxItems</InlineCode>; at the limit the add tile goes away and drops are
              refused.
            </li>
            <li>
              Show a chosen file at once with <InlineCode>URL.createObjectURL(file)</InlineCode> as
              its <InlineCode>previewUrl</InlineCode> (and revoke it when it&apos;s removed), set{' '}
              <InlineCode>{"status: 'uploading'"}</InlineCode> and report{' '}
              <InlineCode>progress</InlineCode> from 0 to 1. Without a progress value a loading
              indicator shows. On failure, set <InlineCode>{"status: 'error'"}</InlineCode> and a
              short <InlineCode>error</InlineCode>.
            </li>
            <li>
              <InlineCode>onReorder(keys)</InlineCode> gets every key in the new order. A
              photo&apos;s menu (<InlineCode>itemActions</InlineCode>, here Move earlier and Move
              later) is another way to reorder that needs no dragging; pass a function to give each
              photo its own entries.
            </li>
            <li>
              Check every file on the server too: its name and type can lie. Pasting photos is up to
              the app, which owns the focused text field.
            </li>
            <li>
              A failed photo&apos;s Retry sits in the start corner (its action menu steps aside), so
              no two 48px targets overlap. Removing a photo moves focus to its neighbour without
              scrolling the page, and the arrow keys stop at the grid&apos;s edge rather than
              scrolling it.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming" className="text-headline-small text-on-surface">
            Theming &amp; tokens
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Tiles have medium corners (<InlineCode>--wm-media-upload-grid-corner</InlineCode>) on{' '}
              <InlineCode>surface-container-highest</InlineCode> while a photo loads; the row&apos;s
              tile size is <InlineCode>--wm-media-upload-grid-tile-size</InlineCode>.
            </li>
            <li>
              Nothing relies on a photo&apos;s colours: the corner buttons sit on{' '}
              <InlineCode>surface-container-highest</InlineCode> (
              <InlineCode>--wm-media-upload-grid-control-container</InlineCode> and{' '}
              <InlineCode>-content</InlineCode>), progress on a circle of the same, and errors on an{' '}
              <InlineCode>error-container</InlineCode> strip. The add tile is{' '}
              <InlineCode>secondary-container</InlineCode>.
            </li>
            <li>
              A dragged photo dims, and a <InlineCode>primary</InlineCode> bar marks where it lands.
              Files dragged over the grid show a dashed <InlineCode>primary</InlineCode> outline and
              the drop message. Photos show the pressed state and ripple as they&apos;re picked up.
              Tiles slide to their new places on the default spatial spring and new ones grow in on
              the fast one; with reduced motion nothing moves, but a new photo still fades in. An
              uploading photo isn&apos;t dimmed. Disabled and drag opacities use the system{' '}
              <InlineCode>--md-sys-state-disabled-*</InlineCode> tokens. Forced colours draw the
              edges, bars and outline in system colours.
            </li>
            <li>
              The corner buttons stay at density 0 in a dense theme, as the tiles keep their size.
            </li>
            <li>
              <InlineCode>classNames</InlineCode> styles the <InlineCode>root</InlineCode>,{' '}
              <InlineCode>grid</InlineCode>, each <InlineCode>item</InlineCode>,{' '}
              <InlineCode>image</InlineCode> and <InlineCode>status</InlineCode>, the{' '}
              <InlineCode>remove</InlineCode>, <InlineCode>retry</InlineCode> and{' '}
              <InlineCode>actions</InlineCode> buttons, the <InlineCode>add</InlineCode> tile and
              the <InlineCode>drop</InlineCode> overlay. <InlineCode>removeIcon</InlineCode>,{' '}
              <InlineCode>retryIcon</InlineCode>, <InlineCode>actionsIcon</InlineCode> and{' '}
              <InlineCode>addIcon</InlineCode> replace the icons.
            </li>
            <li>
              Set the tokens below on the grid (<InlineCode>className</InlineCode>) or any ancestor;
              the root is marked{' '}
              <InlineCode>data-tokens=&quot;wm-media-upload-grid&quot;</InlineCode>.
            </li>
          </ul>
          <TokenTable set={mediaUploadGridTokenSet} caption="Media upload grid tokens" />
        </section>
      </>
    ),
  };
}
