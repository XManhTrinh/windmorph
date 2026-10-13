import { ExampleViewer } from '../../components/example-viewer';
import { ShapedIconSizes } from '../../examples/shaped-icon/shaped-icon-sizes';
import { ShapedIconSteps } from '../../examples/shaped-icon/shaped-icon-steps';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** Shaped icon page body: purpose, examples, accessibility and theming. */
export async function ShapedIconBody() {
  const [steps, sizes] = await Promise.all([
    readExampleSource('shaped-icon/shaped-icon-steps.tsx'),
    readExampleSource('shaped-icon/shaped-icon-sizes.tsx'),
  ]);
  const [stepsHtml, sizesHtml] = await Promise.all([
    highlightSource(steps),
    highlightSource(sizes),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          An icon in a circle or an M3 Expressive shape (a cookie, a flower, a soft burst), in a
          tone&apos;s container colours: emphasis for steps, features and empty states. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
          {code('@windmorph/react-pro')}, built from M3&apos;s shapes and colour roles.{' '}
          {code('EmptyState')} draws its icon with it.
        </p>
        <p className="text-body-large text-on-surface-variant">
          It is decoration, not a control: for something to press use an {code('IconButton')}, and
          for a person or business an {code('Avatar')}.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer title="Steps" code={steps} html={stepsHtml} fileName="shaped-icon-steps.tsx">
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

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Accessibility</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Decorative by default ({code('aria-hidden')}): the text beside it says what it means.
          </li>
          <li>
            When the icon means something on its own, give it an {code('aria-label')}: it becomes an
            image with that name.
          </li>
          <li>
            The icon and its container meet 3:1 contrast in every theme, mode and contrast level.
          </li>
          <li>In forced-colours mode the icon takes the system text colour.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming</h2>
        <p className="text-body-large text-on-surface-variant">
          {code('tone')} picks the container roles ({code('primary')}, {code('secondary')},{' '}
          {code('tertiary')}, {code('neutral')}, {code('error')}); {code('size')} sets the container
          and icon (40/24, 56/28, 64/32 and 96/48px); {code('shape')} is {code('circle')} or any M3
          Expressive shape, drawn as a CSS mask, so the colours follow the theme.
        </p>
      </section>
    </>
  );
}
