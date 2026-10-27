import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const ShapedIconSizes = lazyExample('shaped-icon/shaped-icon-sizes', 'ShapedIconSizes');
const ShapedIconSteps = lazyExample('shaped-icon/shaped-icon-steps', 'ShapedIconSteps');
const ShapedIconColors = lazyExample('shaped-icon/shaped-icon-colors', 'ShapedIconColors');

/** Shaped icon page body: purpose, examples and theming. */
export async function ShapedIconBody(): Promise<ComponentDoc> {
  const [steps, sizes] = await Promise.all([
    readExampleSource('shaped-icon/shaped-icon-steps.tsx'),
    readExampleSource('shaped-icon/shaped-icon-sizes.tsx'),
  ]);
  const [stepsHtml, sizesHtml] = await Promise.all([
    highlightSource(steps),
    highlightSource(sizes),
  ]);

  const colors = await readExampleSource('shaped-icon/shaped-icon-colors.tsx');
  const colorsHtml = await highlightSource(colors);
  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Steps"
            code={steps}
            html={stepsHtml}
            fileName="shaped-icon-steps.tsx"
          >
            <ShapedIconSteps />
          </ExampleViewer>
          <ExampleViewer
            title="Sizes and shapes"
            code={sizes}
            html={sizesHtml}
            fileName="shaped-icon-sizes.tsx"
          >
            <ShapedIconSizes />
          </ExampleViewer>
          <ExampleViewer
            title="Colours"
            code={colors}
            html={colorsHtml}
            fileName="shaped-icon-colors.tsx"
          >
            <ShapedIconColors />
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
            An icon in a circle or an M3 Expressive shape (a cookie, a flower, a soft burst), in a
            colour role&apos;s container colours: emphasis for steps, features and empty states. It
            is <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>, built from M3&apos;s shapes and colour
            roles. <InlineCode>EmptyState</InlineCode> draws its icon with it.
          </p>
          <p className="text-body-large text-on-surface-variant">
            It is decoration, not a control: for something to press use an{' '}
            <InlineCode>IconButton</InlineCode>, and for a person or business an{' '}
            <InlineCode>Avatar</InlineCode>.
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
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>color</InlineCode> picks the container roles (
            <InlineCode>primary</InlineCode>, <InlineCode>secondary</InlineCode>,{' '}
            <InlineCode>tertiary</InlineCode>, <InlineCode>neutral</InlineCode>,{' '}
            <InlineCode>error</InlineCode>); <InlineCode>size</InlineCode> sets the container and
            icon (40/24, 56/28, 64/32 and 96/48px); <InlineCode>shape</InlineCode> is{' '}
            <InlineCode>circle</InlineCode> or a shape outline (
            <InlineCode>{'shape={sunnyShape}'}</InlineCode>, any of the 35 constants from{' '}
            <InlineCode>@windmorph/react/primitives</InlineCode>, or your own{' '}
            <InlineCode>MaterialShapePath</InlineCode>), drawn as a CSS mask, so the colours follow
            the theme; each outline adds only its own path to the bundle. Sizes are in px, so the
            shape keeps its size at larger text sizes. It has no tokens of its own: the root carries{' '}
            <InlineCode>data-tokens=&quot;wm-shaped-icon&quot;</InlineCode> and the parts take{' '}
            <InlineCode>classNames</InlineCode>. In forced colours only the icon stays, in the
            system text colour, since the shape is decoration.
          </p>
        </section>
      </>
    ),
  };
}
