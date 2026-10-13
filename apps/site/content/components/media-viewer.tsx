import { ExampleViewer } from '../../components/example-viewer';
import { MediaViewerActions } from '../../examples/media-viewer/media-viewer-actions';
import { MediaViewerGallery } from '../../examples/media-viewer/media-viewer-gallery';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const EXAMPLES = [
  {
    file: 'media-viewer-gallery.tsx',
    title: 'Opened from thumbnails',
    Example: MediaViewerGallery,
  },
  {
    file: 'media-viewer-actions.tsx',
    title: 'Translated, with an action menu',
    Example: MediaViewerActions,
  },
];

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** Media viewer page body: purpose, examples, gestures, accessibility and theming. */
export async function MediaViewerBody() {
  const sources = await Promise.all(
    EXAMPLES.map((example) => readExampleSource(`media-viewer/${example.file}`)),
  );
  const highlighted = await Promise.all(sources.map((source) => highlightSource(source)));

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A media viewer shows a set of photos full screen: it opens on the photo that was tapped,
          moves between them, zooms, and shows each one&apos;s caption and position (&quot;Photo 2
          of 7&quot;). Use it wherever photos are shown as thumbnails: posts, listings, profiles and
          catalogues. It is <strong className="text-on-surface">not an M3 component</strong>, so it
          comes from {code('@windmorph/react-pro')}.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Control it with {code('open')} and {code('index')} (or leave them uncontrolled with{' '}
          {code('defaultOpen')} and {code('defaultIndex')}), name it with {code('aria-label')}, and
          pass every word through {code('labels')} from your translations. {code('actions')} adds
          controls to the top bar, such as a menu with &quot;Open post&quot;.
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
        <h2 className="text-headline-small text-on-surface">Gestures</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Swipe or drag sideways to move between photos: the photo follows the pointer, then
            settles on the fast spatial spring. A quick flick is enough, and past the first or last
            photo the drag resists.
          </li>
          <li>
            Double-tap or double-click to zoom to 2×; pinch, or use Ctrl or ⌘ with the wheel (a
            trackpad pinch), for up to 4×. Dragging a zoomed photo pans it, and the wheel pans it
            too.
          </li>
          <li>Swipe down on touch to close.</li>
          <li>
            The two photos on each side are loaded ahead. Give each photo its {code('width')} and{' '}
            {code('height')}, so it&apos;s laid out before it loads, and a {code('srcSet')} for
            sharp zooming on large screens.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            It&apos;s a modal dialog named by {code('aria-label')}: focus moves into it and stays
            there, the page behind is hidden from assistive tech, and when it closes focus returns
            to the thumbnail that opened it.
          </li>
          <li>
            The arrow keys move between photos (reversed in right-to-left), Home and End go to the
            first and last, plus and minus zoom, and 0 resets. While zoomed, the arrow keys pan the
            photo instead (four times as far with Shift). Escape closes it.
          </li>
          <li>
            The position is announced politely when it changes. Each photo keeps its alt text, and a
            photo without a caption shows its alt text instead.
          </li>
          <li>
            Every control is an icon button with a 48px target and a tooltip. Previous and Next sit
            at the sides on medium windows and up; on phones, people swipe.
          </li>
          <li>
            A caption cut to two lines becomes a button that expands it. A photo that can&apos;t be
            loaded shows a message in its place.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Photos read best on black, so the viewer fills the window with {code('scrim')} at full
            strength and shows its controls in the theme&apos;s dark colour scheme, in light and
            dark mode alike. The controls take {code('on-surface')}, and Previous and Next are tonal
            so they stay visible over a bright photo. A menu passed in {code('actions')} matches.
          </li>
          <li>
            It fades in on the default effects spring while the photos scale up from 92% on the
            default spatial spring, as a dialog does. With reduced motion it only fades, and photos
            change and zoom without moving.
          </li>
          <li>
            {code('className')} and {code('classNames.root')} style the dialog, and{' '}
            {code('classNames')} reaches the {code('toolbar')}, the {code('media')} area and the{' '}
            {code('caption')}. Forced colours keep every control and the focus ring visible.
          </li>
        </ul>
      </section>
    </>
  );
}
