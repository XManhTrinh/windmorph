import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const ImageCropAvatar = lazyExample('image-crop/image-crop-avatar', 'ImageCropAvatar');
const ImageCropInline = lazyExample('image-crop/image-crop-inline', 'ImageCropInline');

/** Image crop page body: purpose, examples, the server's part and theming. */
export async function ImageCropBody(): Promise<ComponentDoc> {
  const [avatar, inline] = await Promise.all([
    readExampleSource('image-crop/image-crop-avatar.tsx'),
    readExampleSource('image-crop/image-crop-inline.tsx'),
  ]);
  const [avatarHtml, inlineHtml] = await Promise.all([
    highlightSource(avatar),
    highlightSource(inline),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="A profile photo"
            code={avatar}
            html={avatarHtml}
            fileName="image-crop-avatar.tsx"
          >
            <ImageCropAvatar />
          </ExampleViewer>
          <ExampleViewer
            title="Inline, in a 4:5 frame"
            code={inline}
            html={inlineHtml}
            fileName="image-crop-inline.tsx"
          >
            <ImageCropInline />
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
            An image crop frames a photo before it&apos;s uploaded: people drag and zoom the photo
            behind a fixed frame, then confirm. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>: it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>, built from the library&apos;s Dialog,
            Slider and Icon buttons. <InlineCode>ImageCropDialog</InlineCode> is full screen on
            compact windows, narrow (below 600px wide) or short (below 480px tall, a phone held
            sideways), and a basic dialog on larger ones; <InlineCode>ImageCropper</InlineCode> is
            the same area inline.
          </p>
          <p className="text-body-large text-on-surface-variant">
            It reports <strong className="text-on-surface">a rectangle, not an image</strong>: the
            crop in the original photo&apos;s pixels. Upload the original file with it and crop on
            the server, so the photo keeps its full quality and nothing is re-encoded in the
            browser. The rectangle is measured after the photo&apos;s EXIF orientation, so rotate
            first: <InlineCode>sharp(file).rotate().extract(crop)</InlineCode>.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              A pointer drags the photo and two fingers pinch to zoom. Ctrl or ⌘ with the wheel (and
              a trackpad pinch) zooms around the pointer; a plain wheel scrolls the page, as in
              Media viewer.
            </li>
            <li>
              Inline, a vertical swipe over the photo scrolls the page while the photo has nothing
              to move vertically (a landscape photo at zoom 1), so a cropper in a form never traps
              the page. A portrait photo, or one zoomed in, takes the swipe to move. Inside{' '}
              <InlineCode>ImageCropDialog</InlineCode> every gesture moves the photo. The area
              carries <InlineCode>data-zoomed</InlineCode> while zoomed in.
            </li>
            <li>
              When Zoom out or Zoom in reaches its limit and turns itself off, focus moves to the
              other zoom button (or the area), so it never drops to the page.
            </li>
            <li>
              <InlineCode>ImageCropDialog</InlineCode> caps the photo frame&apos;s height to the
              window, so the zoom controls and the actions stay in view inside the dialog&apos;s
              56px margins.
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
              The area is <InlineCode>surface-container-highest</InlineCode> with medium corners;
              outside the frame the photo is dimmed with <InlineCode>scrim</InlineCode> at M3&apos;s
              32%, as a dialog&apos;s scrim. In forced colours the dimmed photo around the frame
              stays visible.
            </li>
            <li>
              The frame is a 2px <InlineCode>outline-variant</InlineCode> edge, and{' '}
              <InlineCode>guide=&quot;circle&quot;</InlineCode> adds a dashed circle showing what a
              round avatar shows. Forced colours draw both in the system text colour.
            </li>
            <li>
              <InlineCode>classNames</InlineCode> styles the cropper&apos;s{' '}
              <InlineCode>root</InlineCode>, <InlineCode>area</InlineCode>,{' '}
              <InlineCode>image</InlineCode>, <InlineCode>frame</InlineCode>,{' '}
              <InlineCode>guide</InlineCode>, <InlineCode>skeleton</InlineCode>,{' '}
              <InlineCode>error</InlineCode>, <InlineCode>controls</InlineCode>,{' '}
              <InlineCode>slider</InlineCode>, <InlineCode>zoomOut</InlineCode> and{' '}
              <InlineCode>zoomIn</InlineCode>. On <InlineCode>ImageCropDialog</InlineCode> it also
              takes the dialog&apos;s <InlineCode>scrim</InlineCode>, <InlineCode>panel</InlineCode>{' '}
              (its surface) and <InlineCode>content</InlineCode>, and{' '}
              <InlineCode>className</InlineCode> goes on the outermost full-window layer, as on the
              core <InlineCode>Dialog</InlineCode>.
            </li>
            <li>
              <InlineCode>zoomInIcon</InlineCode> and <InlineCode>zoomOutIcon</InlineCode> replace
              the zoom buttons&apos; icons, on both components.
            </li>
            <li>
              The dialog&apos;s panel carries the core Dialog&apos;s token set (
              <InlineCode>data-tokens=&quot;md-comp-dialog wm-image-crop-dialog&quot;</InlineCode>),
              so a <InlineCode>--md-comp-dialog-*</InlineCode> theme reaches it; the cropper is
              marked <InlineCode>data-tokens=&quot;wm-image-cropper&quot;</InlineCode>.
            </li>
            <li>
              Resetting with 0 eases the photo back on the M3 effects spring, which never uncovers
              the frame; under reduced motion it jumps there.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
