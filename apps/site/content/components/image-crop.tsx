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
            compact windows and a basic dialog on larger ones; <InlineCode>ImageCropper</InlineCode>{' '}
            is the same area inline.
          </p>
          <p className="text-body-large text-on-surface-variant">
            It reports <strong className="text-on-surface">a rectangle, not an image</strong>: the
            crop in the original photo&apos;s pixels. Upload the original file with it and crop on
            the server, so the photo keeps its full quality and nothing is re-encoded in the
            browser. The rectangle is measured after the photo&apos;s EXIF orientation, so rotate
            first: <InlineCode>sharp(file).rotate().extract(crop)</InlineCode>.
          </p>
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
              outside the frame the photo is dimmed with <InlineCode>scrim</InlineCode> at 56%,
              stronger than a dialog&apos;s 32% so the frame reads over any photo.
            </li>
            <li>
              The frame is a 2px <InlineCode>outline-variant</InlineCode> edge, and{' '}
              <InlineCode>guide=&quot;circle&quot;</InlineCode> adds a dashed circle showing what a
              round avatar shows. Forced colours draw both in the system text colour.
            </li>
            <li>Resetting eases back on the M3 spatial spring; with reduced motion it jumps.</li>
          </ul>
        </section>
      </>
    ),
  };
}
