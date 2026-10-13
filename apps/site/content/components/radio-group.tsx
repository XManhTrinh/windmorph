import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { RadioGroupBasic } from '../../examples/radio-group/radio-group-basic';
import { RadioGroupHorizontal } from '../../examples/radio-group/radio-group-horizontal';
import { RadioGroupStates } from '../../examples/radio-group/radio-group-states';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** RadioGroup + Radio page body. */
export async function RadioGroupBody(): Promise<ComponentDoc> {
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

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Basic"
            code={basic}
            html={basicHtml}
            fileName="radio-group-basic.tsx"
          >
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
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Radio buttons let people pick exactly one option from a set. Use them when all the
            options should be visible at once; for many options a <InlineCode>Select</InlineCode> is
            tidier, and for independent on/off choices use <InlineCode>Checkbox</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Always wrap <InlineCode>Radio</InlineCode> options in a{' '}
            <InlineCode>RadioGroup</InlineCode> — the group owns the selection, the label, arrow-key
            navigation and validation. A <InlineCode>Radio</InlineCode> rendered outside a group
            throws.
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
              The group is a <InlineCode>radiogroup</InlineCode> (React Aria{' '}
              <InlineCode>useRadioGroup</InlineCode>); give it a <InlineCode>label</InlineCode> or
              an <InlineCode>aria-label</InlineCode> / <InlineCode>aria-labelledby</InlineCode>.
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
              A <InlineCode>Radio</InlineCode> must live inside a{' '}
              <InlineCode>RadioGroup</InlineCode> — using one on its own throws at render.
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
              A 20px ring with a 2px stroke; the 10px dot grows on the fast spatial spring and
              recolours on default effects.
            </li>
            <li>
              The unselected ring darkens to <InlineCode>on-surface</InlineCode> on hover, focus and
              press. Disabled is <InlineCode>on-surface</InlineCode> at 38%, which also overrides
              the selected colour.
            </li>
            <li>
              M3 radios have <strong>no error colour</strong> of their own; an invalid{' '}
              <InlineCode>RadioGroup</InlineCode> shows its error text instead.
            </li>
            <li>
              The <InlineCode>RadioGroup</InlineCode> provides the state, arrow keys, the label (
              <InlineCode>text-title-small</InlineCode>), supporting / error text and{' '}
              <InlineCode>orientation</InlineCode>.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
