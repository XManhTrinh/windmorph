import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const MediaViewerActions = lazyExample('media-viewer/media-viewer-actions', 'MediaViewerActions');
const MediaViewerGallery = lazyExample('media-viewer/media-viewer-gallery', 'MediaViewerGallery');

/** Media viewer page body: purpose, examples, gestures and theming. */
export async function MediaViewerBody(): Promise<ComponentDoc> {
  const [gallery, actions] = await Promise.all([
    readExampleSource('media-viewer/media-viewer-gallery.tsx'),
    readExampleSource('media-viewer/media-viewer-actions.tsx'),
  ]);
  const [galleryHtml, actionsHtml] = await Promise.all([
    highlightSource(gallery),
    highlightSource(actions),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Opened from thumbnails"
            code={gallery}
            html={galleryHtml}
            fileName="media-viewer-gallery.tsx"
          >
            <MediaViewerGallery />
          </ExampleViewer>
          <ExampleViewer
            title="Translated, with an action menu"
            code={actions}
            html={actionsHtml}
            fileName="media-viewer-actions.tsx"
          >
            <MediaViewerActions />
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
            A media viewer shows a set of photos full screen: it opens on the photo that was tapped,
            moves between them, zooms, and shows each one&apos;s caption and position (&quot;Photo 2
            of 7&quot;). Use it wherever photos are shown as thumbnails: posts, listings, profiles
            and catalogues. It is <strong className="text-on-surface">not an M3 component</strong>,
            so it comes from <InlineCode>@windmorph/react-pro</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Control it with <InlineCode>open</InlineCode> and <InlineCode>index</InlineCode> (or
            leave them uncontrolled with <InlineCode>defaultOpen</InlineCode> and{' '}
            <InlineCode>defaultIndex</InlineCode>), name it with <InlineCode>aria-label</InlineCode>
            , and pass every word through <InlineCode>labels</InlineCode> from your translations.{' '}
            <InlineCode>actions</InlineCode> adds controls to the top bar, such as a menu with
            &quot;Open post&quot;. Pass the thumbnail that was tapped as{' '}
            <InlineCode>origin</InlineCode>, and the viewer grows out of it and shrinks back into
            it, the M3 container transform; keep it on the open photo&apos;s thumbnail as the viewer
            moves, so it closes into the right one.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="gestures" className="text-headline-small text-on-surface">
            Gestures
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Swipe or drag sideways to move between photos: the photo follows the pointer, then
              settles on the fast spatial spring. A quick flick is enough, and past the first or
              last photo the drag resists.
            </li>
            <li>
              Double-tap or double-click to zoom to 2×; pinch, or use Ctrl or ⌘ with the wheel (a
              trackpad pinch), for up to 4×. Dragging a zoomed photo pans it, and the wheel pans it
              too.
            </li>
            <li>Swipe down on touch to close.</li>
            <li>
              The two photos on each side are loaded ahead. Give each photo its{' '}
              <InlineCode>width</InlineCode> and <InlineCode>height</InlineCode>, so it&apos;s laid
              out before it loads, and a <InlineCode>srcSet</InlineCode> for sharp zooming on large
              screens.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming" className="text-headline-small text-on-surface">
            Theming
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              It is the core&apos;s full-screen <InlineCode>Dialog</InlineCode> (role{' '}
              <InlineCode>dialog</InlineCode>), so it takes the dialog&apos;s focus handling, Escape
              and motion: without an <InlineCode>origin</InlineCode> it slides up and fades in as a
              full-screen dialog does; with one it grows out of it. Its panel joins the core
              dialog&apos;s tokens (<InlineCode>md-comp-dialog wm-media-viewer</InlineCode>).
            </li>
            <li>
              Photos read best on black, so the viewer fills the window with a black backdrop and
              shows its controls in the theme&apos;s dark colour scheme, in light and dark mode
              alike. The top bar is the full-screen header&apos;s 56px, with the position in{' '}
              <InlineCode>title-large</InlineCode>; its icon buttons are{' '}
              <InlineCode>standard</InlineCode> and keep density 0, and Previous and Next are tonal
              so they stay visible over a bright photo. A menu passed in{' '}
              <InlineCode>actions</InlineCode> matches.
            </li>
            <li>With reduced motion it only fades, and photos change and zoom without moving.</li>
            <li>
              As on the core <InlineCode>Dialog</InlineCode>, <InlineCode>className</InlineCode> and{' '}
              <InlineCode>style</InlineCode> go on the outermost, full-window layer, so a layout
              class never hides or clips the viewer; <InlineCode>ref</InlineCode> and other
              attributes go on the panel. <InlineCode>classNames</InlineCode> reaches the{' '}
              <InlineCode>panel</InlineCode>, the <InlineCode>backdrop</InlineCode>, the{' '}
              <InlineCode>toolbar</InlineCode>, its <InlineCode>position</InlineCode> and{' '}
              <InlineCode>actions</InlineCode>, the <InlineCode>media</InlineCode> area,{' '}
              <InlineCode>previous</InlineCode>, <InlineCode>next</InlineCode> and the{' '}
              <InlineCode>caption</InlineCode>.
            </li>
            <li>
              <InlineCode>closeIcon</InlineCode>, <InlineCode>previousIcon</InlineCode>,{' '}
              <InlineCode>nextIcon</InlineCode>, <InlineCode>zoomInIcon</InlineCode> and{' '}
              <InlineCode>zoomOutIcon</InlineCode> replace the built-in icons (Previous and Next are
              mirrored in right-to-left layouts). Forced colours keep every control and the focus
              ring visible.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
