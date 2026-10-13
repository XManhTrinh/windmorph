import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { ImageCropAvatar } from '../../examples/image-crop/image-crop-avatar';
import { ImageCropInline } from '../../examples/image-crop/image-crop-inline';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

const EXAMPLES = [
  { file: 'image-crop-avatar.tsx', title: 'A profile photo', Example: ImageCropAvatar },
  { file: 'image-crop-inline.tsx', title: 'Inline, in a 4:5 frame', Example: ImageCropInline },
];

/** Image crop page body: purpose, examples, the server's part, accessibility and theming. */
export async function ImageCropBody(): Promise<ComponentDoc> {
  const sources = await Promise.all(
    EXAMPLES.map((example) => readExampleSource(`image-crop/${example.file}`)),
  );
  const highlighted = await Promise.all(sources.map((source) => highlightSource(source)));

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="keyboard-and-screen-reader" className="text-headline-small text-on-surface">
            Keyboard &amp; screen reader
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The photo area is one focusable group (&quot;Photo position&quot;), described by how
              to use it. Arrow keys move the photo 10px (50px with Shift), plus and minus zoom, and
              0 resets.
            </li>
            <li>
              The zoom slider and the zoom out and in buttons sit under the area, so every action
              has a way that needs no dragging (WCAG 2.2, 2.5.7). The slider reads its value as a
              percentage.
            </li>
            <li>
              A pointer drags the photo, two fingers pinch to zoom, and the mouse wheel or a
              trackpad pinch zooms around the pointer without scrolling the page.
            </li>
            <li>
              A photo that can&apos;t be opened (HEIC in some browsers, or a file that isn&apos;t an
              image) shows a message announced as an alert, and the confirm button stays disabled.
              While <InlineCode>busy</InlineCode>, a progress bar shows and the dialog can&apos;t be
              dismissed.
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
