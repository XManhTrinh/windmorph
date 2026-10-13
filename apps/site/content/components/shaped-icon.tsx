import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { ShapedIconSizes } from '../../examples/shaped-icon/shaped-icon-sizes';
import { ShapedIconSteps } from '../../examples/shaped-icon/shaped-icon-steps';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Shaped icon page body: purpose, examples, accessibility and theming. */
export async function ShapedIconBody(): Promise<ComponentDoc> {
  const [steps, sizes] = await Promise.all([
    readExampleSource('shaped-icon/shaped-icon-steps.tsx'),
    readExampleSource('shaped-icon/shaped-icon-sizes.tsx'),
  ]);
  const [stepsHtml, sizesHtml] = await Promise.all([
    highlightSource(steps),
    highlightSource(sizes),
  ]);

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
            tone&apos;s container colours: emphasis for steps, features and empty states. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
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
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="accessibility" className="text-headline-small text-on-surface">
            Accessibility
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Decorative by default (<InlineCode>aria-hidden</InlineCode>): the text beside it says
              what it means.
            </li>
            <li>
              When the icon means something on its own, give it an{' '}
              <InlineCode>aria-label</InlineCode>: it becomes an image with that name.
            </li>
            <li>
              The icon and its container meet 3:1 contrast in every theme, mode and contrast level.
            </li>
            <li>In forced-colours mode the icon takes the system text colour.</li>
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
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>tone</InlineCode> picks the container roles (
            <InlineCode>primary</InlineCode>, <InlineCode>secondary</InlineCode>,{' '}
            <InlineCode>tertiary</InlineCode>, <InlineCode>neutral</InlineCode>,{' '}
            <InlineCode>error</InlineCode>); <InlineCode>size</InlineCode> sets the container and
            icon (40/24, 56/28, 64/32 and 96/48px); <InlineCode>shape</InlineCode> is{' '}
            <InlineCode>circle</InlineCode> or any M3 Expressive shape, drawn as a CSS mask, so the
            colours follow the theme.
          </p>
        </section>
      </>
    ),
  };
}
