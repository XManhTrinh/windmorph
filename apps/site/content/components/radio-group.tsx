import { ExampleViewer } from '../../components/example-viewer';
import { RadioGroupBasic } from '../../examples/radio-group/radio-group-basic';
import { RadioGroupHorizontal } from '../../examples/radio-group/radio-group-horizontal';
import { RadioGroupStates } from '../../examples/radio-group/radio-group-states';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** RadioGroup + Radio page body. */
export async function RadioGroupBody() {
  const [basic, horizontal, states] = await Promise.all([
    readExampleSource('radio-group/radio-group-basic.tsx'),
    readExampleSource('radio-group/radio-group-horizontal.tsx'),
    readExampleSource('radio-group/radio-group-states.tsx'),
  ]);
  const [basicHtml, horizontalHtml, statesHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(horizontal),
    highlightSource(states),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Radio buttons let people pick exactly one option from a set. Use them when all the options
          should be visible at once; for many options a{' '}
          <code className="text-on-surface">Select</code> is tidier, and for independent on/off
          choices use <code className="text-on-surface">Checkbox</code>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Always wrap <code className="text-on-surface">Radio</code> options in a{' '}
          <code className="text-on-surface">RadioGroup</code> — the group owns the selection, the
          label, arrow-key navigation and validation. A{' '}
          <code className="text-on-surface">Radio</code> rendered outside a group throws.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer title="Basic" code={basic} html={basicHtml} fileName="radio-group-basic.tsx">
          <RadioGroupBasic />
        </ExampleViewer>
        <ExampleViewer
          title="Horizontal"
          code={horizontal}
          html={horizontalHtml}
          fileName="radio-group-horizontal.tsx"
        >
          <RadioGroupHorizontal />
        </ExampleViewer>
        <ExampleViewer
          title="Disabled and error"
          code={states}
          html={statesHtml}
          fileName="radio-group-states.tsx"
        >
          <RadioGroupStates />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The group is a <code className="text-on-surface">radiogroup</code> (React Aria{' '}
            <code className="text-on-surface">useRadioGroup</code>); give it a{' '}
            <code className="text-on-surface">label</code> or an{' '}
            <code className="text-on-surface">aria-label</code> /{' '}
            <code className="text-on-surface">aria-labelledby</code>.
          </li>
          <li>
            Tab moves focus into the group; the arrow keys move the selection between options and
            wrap around. Each option has a 40px state layer and a 48px touch target.
          </li>
          <li>
            Supporting text is the group&apos;s description; when invalid, the group&apos;s error
            message is shown below the options.
          </li>
          <li>
            A <code className="text-on-surface">Radio</code> must live inside a{' '}
            <code className="text-on-surface">RadioGroup</code> — using one on its own throws at
            render.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A 20px ring with a 2px stroke; the 10px dot grows on the fast spatial spring and
            recolours on default effects.
          </li>
          <li>
            The unselected ring darkens to <code className="text-on-surface">on-surface</code> on
            hover, focus and press. Disabled is <code className="text-on-surface">on-surface</code>{' '}
            at 38%, which also overrides the selected colour.
          </li>
          <li>
            M3 radios have <strong>no error colour</strong> of their own; an invalid{' '}
            <code className="text-on-surface">RadioGroup</code> shows its error text instead.
          </li>
          <li>
            The <code className="text-on-surface">RadioGroup</code> provides the state, arrow keys,
            the label (<code className="text-on-surface">text-title-small</code>), supporting /
            error text and <code className="text-on-surface">orientation</code>.
          </li>
        </ul>
      </section>
    </>
  );
}
