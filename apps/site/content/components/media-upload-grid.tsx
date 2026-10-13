import { ExampleViewer } from '../../components/example-viewer';
import { MediaUploadGridComposer } from '../../examples/media-upload-grid/media-upload-grid-composer';
import { MediaUploadGridRow } from '../../examples/media-upload-grid/media-upload-grid-row';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

const EXAMPLES = [
  {
    file: 'media-upload-grid-composer.tsx',
    title: 'A post composer: progress, retry, reorder and a menu',
    Example: MediaUploadGridComposer,
  },
  { file: 'media-upload-grid-row.tsx', title: 'One scrolling row', Example: MediaUploadGridRow },
];

/** Media upload grid page body: purpose, examples, the app's part, accessibility and theming. */
export async function MediaUploadGridBody() {
  const sources = await Promise.all(
    EXAMPLES.map((example) => readExampleSource(`media-upload-grid/${example.file}`)),
  );
  const highlighted = await Promise.all(sources.map((source) => highlightSource(source)));

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          The photos someone is adding to a post, listing or product: a square thumbnail for each,
          with its upload progress or the reason it failed, a remove button, an optional menu, and
          an &quot;Add photos&quot; tile. Files dropped on the grid are added too, and photos
          reorder by dragging. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>: it comes from{' '}
          <InlineCode>@windmorph/react-pro</InlineCode>, built on React Aria&apos;s grid list drag
          and drop and the library&apos;s File trigger, Icon buttons, Menu and progress indicators.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A grid fills its container&apos;s width with 3 columns, 4 from 600px and 5 from 840px (the
          grid&apos;s own width, so it fits a dialog as well as a page);{' '}
          <InlineCode>{'layout="row"'}</InlineCode> is one scrolling row of 112px tiles.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        {EXAMPLES.map(({ file, title, Example }, index) => (
          <ExampleViewer
            key={file}
            title={title}
            code={sources[index]!}
            html={highlighted[index]!}
            fileName={file}
          >
            <Example />
          </ExampleViewer>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">The app&apos;s part</h2>
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
            <InlineCode>onReorder(keys)</InlineCode> gets every key in the new order. A photo&apos;s
            menu (<InlineCode>itemActions</InlineCode>, here Move earlier and Move later) is another
            way to reorder that needs no dragging; pass a function to give each photo its own
            entries.
          </li>
          <li>
            Check every file on the server too: its name and type can lie. Pasting photos is up to
            the app, which owns the focused text field.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The grid is one Tab stop. The arrow keys move between photos (following the reading
            direction in right-to-left), and Tab reaches the focused photo&apos;s buttons.
          </li>
          <li>
            Each photo is named by its <InlineCode>alt</InlineCode> and its state (&quot;Uploading,
            40%&quot;, &quot;Couldn&apos;t upload. Too large&quot;); the buttons are named after it
            (&quot;Remove Lake at dusk&quot;) and show that name as a tooltip on hover and keyboard
            focus. Every word comes from <InlineCode>labels</InlineCode>.
          </li>
          <li>
            To move a photo, press Enter on it, then the arrow keys between the places it can go
            (&quot;Insert between … and …&quot;), then Enter to drop it or Escape to cancel. Each
            step is announced. A mouse drags it; on touch, a long press picks it up, so the page
            still scrolls.
          </li>
          <li>
            Removing a photo moves focus to the next one, and Retry keeps focus on the photo. Every
            button is at least 48px to touch.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming</h2>
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
            the drop message. Tiles slide to their new places on the default spatial spring and new
            ones grow in on the fast one; with reduced motion nothing moves. Forced colours draw the
            edges, bars and outline in system colours.
          </li>
        </ul>
      </section>
    </>
  );
}
