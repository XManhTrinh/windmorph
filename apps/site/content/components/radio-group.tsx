import { radioTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const RadioGroupBasic = lazyExample('radio-group/radio-group-basic', 'RadioGroupBasic');
const RadioGroupHorizontal = lazyExample(
  'radio-group/radio-group-horizontal',
  'RadioGroupHorizontal',
);
const RadioGroupStates = lazyExample('radio-group/radio-group-states', 'RadioGroupStates');
const RadioGroupDensityExample = lazyExample(
  'radio-group/radio-group-density',
  'RadioGroupDensity',
);

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

  const densitySource = await readExampleSource('radio-group/radio-group-density.tsx');
  const densityHtml = await highlightSource(densitySource);
  return {
    tokens: [radioTokenSet],
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
          <ExampleViewer
            title="Density"
            code={densitySource}
            html={densityHtml}
            fileName="radio-group-density.tsx"
          >
            <RadioGroupDensityExample />
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
          <p className="text-body-large text-on-surface-variant">
            List the options vertically, one per line, as M3 asks (&ldquo;Avoid using horizontal
            radio button lists&rdquo;): a column is quicker to scan and keeps each label beside its
            own button. Keep <InlineCode>orientation=&quot;horizontal&quot;</InlineCode> for two or
            three short options, such as Yes and No.
          </p>
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
