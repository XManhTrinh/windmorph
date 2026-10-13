import { ExampleViewer } from '../../components/example-viewer';
import { CheckboxBasic } from '../../examples/checkbox/checkbox-basic';
import { CheckboxIndeterminate } from '../../examples/checkbox/checkbox-indeterminate';
import { CheckboxStates } from '../../examples/checkbox/checkbox-states';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Checkbox page body. */
export async function CheckboxBody() {
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

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Checkboxes let people select any number of options from a set, or turn a single option on
          or off. Use a <code className="text-on-surface">Switch</code> for an immediate on/off
          setting, and a <code className="text-on-surface">RadioGroup</code> when only one choice in
          a set is allowed.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A checkbox needs an accessible name — give it label{' '}
          <code className="text-on-surface">children</code>, or an{' '}
          <code className="text-on-surface">aria-label</code> /{' '}
          <code className="text-on-surface">aria-labelledby</code> when there is no visible text
          (the types enforce one).
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A visually hidden native checkbox (React Aria{' '}
            <code className="text-on-surface">useCheckbox</code>) carries the state, so forms,
            labels and assistive tech work natively.
          </li>
          <li>
            Tab moves focus; Space toggles the box. The control has a 40px state layer and a 48px
            touch target.
          </li>
          <li>
            <code className="text-on-surface">indeterminate</code> is purely visual (a dash); the
            underlying checked state is unchanged until the user acts.
          </li>
          <li>
            An accessible name is required; <code className="text-on-surface">required</code> maps
            to <code className="text-on-surface">aria-required</code> and{' '}
            <code className="text-on-surface">invalid</code> exposes the error state.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Uses Compose&apos;s <strong>M3 styling</strong> (
            <code className="text-on-surface">isCheckboxStylingFixEnabled = true</code>), which
            Compose itself defaults to off (keeping M2 styling): an 18px box with 2px corners and a
            2px outline.
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
            Error uses the <code className="text-on-surface">error</code> /{' '}
            <code className="text-on-surface">on-error</code> roles; disabled-checked is{' '}
            <code className="text-on-surface">on-surface</code> at 38% with a{' '}
            <code className="text-on-surface">surface</code> check.
          </li>
          <li>
            <strong>No CheckboxGroup</strong> in v1 (Compose has none); a fieldset of checkboxes
            with a shared <code className="text-on-surface">name</code> covers forms.
          </li>
        </ul>
      </section>
    </>
  );
}
