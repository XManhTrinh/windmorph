import { iconButtonTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const IconButtonSizes = lazyExample('icon-button/icon-button-sizes', 'IconButtonSizes');
const IconButtonToggle = lazyExample('icon-button/icon-button-toggle', 'IconButtonToggle');
const IconButtonVariants = lazyExample('icon-button/icon-button-variants', 'IconButtonVariants');
const IconButtonShapes = lazyExample('icon-button/icon-button-shapes', 'IconButtonShapes');
const IconButtonRotate = lazyExample('icon-button/icon-button-rotate', 'IconButtonRotate');
const IconButtonToggleVariants = lazyExample(
  'icon-button/icon-button-toggle-variants',
  'IconButtonToggleVariants',
);
const IconButtonDensityExample = lazyExample(
  'icon-button/icon-button-density',
  'IconButtonDensity',
);

/** IconButton page body. */
export async function IconButtonBody(): Promise<ComponentDoc> {
  const [variants, sizes, toggle] = await Promise.all([
    readExampleSource('icon-button/icon-button-variants.tsx'),
    readExampleSource('icon-button/icon-button-sizes.tsx'),
    readExampleSource('icon-button/icon-button-toggle.tsx'),
  ]);
  const [variantsHtml, sizesHtml, toggleHtml] = await Promise.all([
    highlightSource(variants),
    highlightSource(sizes),
    highlightSource(toggle),
  ]);

  const [shapesSrc, toggleVariantsSrc, rotateSrc] = await Promise.all([
    readExampleSource('icon-button/icon-button-shapes.tsx'),
    readExampleSource('icon-button/icon-button-toggle-variants.tsx'),
    readExampleSource('icon-button/icon-button-rotate.tsx'),
  ]);
  const [shapesSrcHtml, toggleVariantsSrcHtml, rotateSrcHtml] = await Promise.all([
    highlightSource(shapesSrc),
    highlightSource(toggleVariantsSrc),
    highlightSource(rotateSrc),
  ]);

  const densitySource = await readExampleSource('icon-button/icon-button-density.tsx');
  const densityHtml = await highlightSource(densitySource);
  return {
    tokens: [iconButtonTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Variants"
            code={variants}
            html={variantsHtml}
            fileName="icon-button-variants.tsx"
          >
            <IconButtonVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Sizes and widths"
            code={sizes}
            html={sizesHtml}
            fileName="icon-button-sizes.tsx"
          >
            <IconButtonSizes />
          </ExampleViewer>
          <ExampleViewer
            title="Shapes"
            code={shapesSrc}
            html={shapesSrcHtml}
            fileName="icon-button-shapes.tsx"
          >
            <IconButtonShapes />
          </ExampleViewer>
          <ExampleViewer
            title="Toggle"
            code={toggle}
            html={toggleHtml}
            fileName="icon-button-toggle.tsx"
          >
            <IconButtonToggle />
          </ExampleViewer>
          <ExampleViewer
            title="Rotating icon"
            code={rotateSrc}
            html={rotateSrcHtml}
            fileName="icon-button-rotate.tsx"
          >
            <IconButtonRotate />
          </ExampleViewer>
          <ExampleViewer
            title="Toggle colour styles"
            code={toggleVariantsSrc}
            html={toggleVariantsSrcHtml}
            fileName="icon-button-toggle-variants.tsx"
          >
            <IconButtonToggleVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Density"
            code={densitySource}
            html={densityHtml}
            fileName="icon-button-density.tsx"
          >
            <IconButtonDensityExample />
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
            Icon buttons trigger an action with just an icon, so they suit toolbars, list rows and
            dense layouts where a labelled <InlineCode>Button</InlineCode> would not fit. Use one
            only when the icon&apos;s meaning is unambiguous.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Because there is no visible text, an accessible name is <em>required</em>: every icon
            button must pass <InlineCode>aria-label</InlineCode> or{' '}
            <InlineCode>aria-labelledby</InlineCode> (the types enforce it).
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 id="icons" className="text-headline-small text-on-surface">
            Icons
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Use a system icon whose meaning is clear on its own (search, delete, share), not a
              decorative or custom one people have to learn.
            </li>
            <li>
              For a toggle, show the outlined icon when unselected and its filled form when selected
              (<InlineCode>selectedIcon</InlineCode>). If an icon has no filled version, use a
              semibold weight of it for the selected state instead.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="differences-from-compose" className="text-headline-small text-on-surface">
            Differences from Compose
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Variants are <InlineCode>filled | tonal | outlined | standard</InlineCode> — no
              elevated or text. Filled is the default, as in the M3 Expressive specs (Compose&apos;s
              plain <InlineCode>IconButton</InlineCode> is standard). Toolbars and app bars make
              their icon buttons standard by default through <InlineCode>ButtonContext</InlineCode>.
            </li>
            <li>
              <InlineCode>width</InlineCode> (narrow / default / wide) is the icon size plus leading
              and trailing space; Compose&apos;s <InlineCode>Uniform</InlineCode> option is the
              default width.
            </li>
            <li>
              Standard icons are <InlineCode>on-surface-variant</InlineCode>, and outlined ones are
              too, inside an <InlineCode>outline-variant</InlineCode> outline (the spec&apos;s
              colour table). A container that needs its own content colour, like a vibrant toolbar,
              sets <InlineCode>--md-comp-icon-button-icon-color</InlineCode> (to{' '}
              <InlineCode>currentColor</InlineCode> to inherit it), which the standard and outlined
              icon colour tokens fall back to.
            </li>
            <li>
              Selected toggles: standard turns <InlineCode>primary</InlineCode>, filled{' '}
              <InlineCode>primary</InlineCode>/<InlineCode>on-primary</InlineCode>, tonal{' '}
              <InlineCode>secondary</InlineCode>/<InlineCode>on-secondary</InlineCode>, outlined
              inverse-surface with no border, disabled or not; shape swaps round ↔ square.
            </li>
            <li>
              A disabled outlined icon button&apos;s outline dims to{' '}
              <InlineCode>outline-variant</InlineCode> at 10%, the same as a disabled outlined
              button (Compose&apos;s code draws it at 38% of the content colour).
            </li>
            <li>
              Reads <InlineCode>size</InlineCode> / <InlineCode>shape</InlineCode> /{' '}
              <InlineCode>disabled</InlineCode> and its default{' '}
              <InlineCode>iconButtonVariant</InlineCode> from <InlineCode>ButtonContext</InlineCode>
              , but not the Button <InlineCode>variant</InlineCode>, because the variant sets
              differ.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
