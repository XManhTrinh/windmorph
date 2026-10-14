import { checkboxTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const CheckboxBasic = lazyExample('checkbox/checkbox-basic', 'CheckboxBasic');
const CheckboxIndeterminate = lazyExample(
  'checkbox/checkbox-indeterminate',
  'CheckboxIndeterminate',
);
const CheckboxStates = lazyExample('checkbox/checkbox-states', 'CheckboxStates');

/** Checkbox page body. */
export async function CheckboxBody(): Promise<ComponentDoc> {
  const [basic, indeterminate, states] = await Promise.all([
    readExampleSource('checkbox/checkbox-basic.tsx'),
    readExampleSource('checkbox/checkbox-indeterminate.tsx'),
    readExampleSource('checkbox/checkbox-states.tsx'),
  ]);
  const [basicHtml, indeterminateHtml, statesHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(indeterminate),
    highlightSource(states),
  ]);

  return {
    tokens: [checkboxTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer title="Basic" code={basic} html={basicHtml} fileName="checkbox-basic.tsx">
            <CheckboxBasic />
          </ExampleViewer>
          <ExampleViewer
            title="Indeterminate (select all)"
            code={indeterminate}
            html={indeterminateHtml}
            fileName="checkbox-indeterminate.tsx"
          >
            <CheckboxIndeterminate />
          </ExampleViewer>
          <ExampleViewer
            title="Disabled and error"
            code={states}
            html={statesHtml}
            fileName="checkbox-states.tsx"
          >
            <CheckboxStates />
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
            Checkboxes let people select any number of options from a set, or turn a single option
            on or off. Use a <InlineCode>Switch</InlineCode> for an immediate on/off setting, and a{' '}
            <InlineCode>RadioGroup</InlineCode> when only one choice in a set is allowed.
          </p>
          <p className="text-body-large text-on-surface-variant">
            A checkbox needs an accessible name — give it label <InlineCode>children</InlineCode>,
            or an <InlineCode>aria-label</InlineCode> / <InlineCode>aria-labelledby</InlineCode>{' '}
            when there is no visible text (the types enforce one).
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
              A visually hidden native checkbox (React Aria <InlineCode>useCheckbox</InlineCode>)
              carries the state, so forms, labels and assistive tech work natively.
            </li>
            <li>
              Tab moves focus; Space toggles the box. The control has a 40px state layer and a 48px
              touch target.
            </li>
            <li>
              <InlineCode>indeterminate</InlineCode> is purely visual (a dash); the underlying
              checked state is unchanged until the user acts.
            </li>
            <li>
              An accessible name is required; <InlineCode>required</InlineCode> maps to{' '}
              <InlineCode>aria-required</InlineCode> and <InlineCode>invalid</InlineCode> exposes
              the error state.
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
              Uses Compose&apos;s <strong>M3 styling</strong> (
              <InlineCode>isCheckboxStylingFixEnabled = true</InlineCode>), which Compose itself
              defaults to off (keeping M2 styling): an 18px box with 2px corners and a 2px outline.
              The outline is <InlineCode>on-surface-variant</InlineCode>, darkening to{' '}
              <InlineCode>on-surface</InlineCode> on hover, focus and press; a checked or
              indeterminate box has no outline, so an invalid one is a plain{' '}
              <InlineCode>error</InlineCode> fill.
            </li>
            <li>
              Motion: the check draws on the default spatial spring and snaps away 100ms after
              unchecking; the box fills on default effects and empties on fast effects.
            </li>
            <li>
              <strong>Deviation:</strong> Compose morphs the check into the indeterminate dash, but
              CSS can&apos;t animate a path shape in Safari, so the dash draws on its own.
            </li>
            <li>
              Error uses the <InlineCode>error</InlineCode> / <InlineCode>on-error</InlineCode>{' '}
              roles; disabled-checked is <InlineCode>on-surface</InlineCode> at 38% with a{' '}
              <InlineCode>surface</InlineCode> check.
            </li>
            <li>
              <strong>No CheckboxGroup</strong> in v1 (Compose has none); a fieldset of checkboxes
              with a shared <InlineCode>name</InlineCode> covers forms.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
