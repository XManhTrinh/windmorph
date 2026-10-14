import { textFieldTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const TextFieldForm = lazyExample('text-field/text-field-form', 'TextFieldForm');
const TextFieldAdornments = lazyExample('text-field/text-field-adornments', 'TextFieldAdornments');
const TextFieldMultiline = lazyExample('text-field/text-field-multiline', 'TextFieldMultiline');
const TextFieldStates = lazyExample('text-field/text-field-states', 'TextFieldStates');
const TextFieldVariants = lazyExample('text-field/text-field-variants', 'TextFieldVariants');

/** TextField page body: purpose, live examples, accessibility and Compose differences. */
export async function TextFieldBody(): Promise<ComponentDoc> {
  const [variants, adornments, states, multiline, form] = await Promise.all([
    readExampleSource('text-field/text-field-variants.tsx'),
    readExampleSource('text-field/text-field-adornments.tsx'),
    readExampleSource('text-field/text-field-states.tsx'),
    readExampleSource('text-field/text-field-multiline.tsx'),
    readExampleSource('text-field/text-field-form.tsx'),
  ]);
  const [variantsHtml, adornmentsHtml, statesHtml, multilineHtml, formHtml] = await Promise.all([
    highlightSource(variants),
    highlightSource(adornments),
    highlightSource(states),
    highlightSource(multiline),
    highlightSource(form),
  ]);

  return {
    tokens: [textFieldTokenSet],
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
            fileName="text-field-variants.tsx"
          >
            <TextFieldVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Icons, prefix and suffix"
            code={adornments}
            html={adornmentsHtml}
            fileName="text-field-adornments.tsx"
          >
            <TextFieldAdornments />
          </ExampleViewer>
          <ExampleViewer
            title="Required, disabled, read-only and error"
            code={states}
            html={statesHtml}
            fileName="text-field-states.tsx"
          >
            <TextFieldStates />
          </ExampleViewer>
          <ExampleViewer
            title="Text area, growing field and character counter"
            code={multiline}
            html={multilineHtml}
            fileName="text-field-multiline.tsx"
          >
            <TextFieldMultiline />
          </ExampleViewer>
          <ExampleViewer
            title="In a form"
            code={form}
            html={formHtml}
            fileName="text-field-form.tsx"
          >
            <TextFieldForm />
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
            Text fields let people enter and edit text. Reach for one for free-form input like a
            name, email or message; use a <InlineCode>Select</InlineCode>,{' '}
            <InlineCode>RadioGroup</InlineCode> or <InlineCode>Checkbox</InlineCode> when the
            choices are fixed.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Every field needs a name: pass a visible <InlineCode>label</InlineCode> or, when the
            context already makes the purpose clear, an <InlineCode>aria-label</InlineCode> /{' '}
            <InlineCode>aria-labelledby</InlineCode> (the types enforce one). The value is
            controlled through <InlineCode>value</InlineCode> /{' '}
            <InlineCode>onChange(value)</InlineCode> or left uncontrolled with{' '}
            <InlineCode>defaultValue</InlineCode>.
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
              A <InlineCode>label</InlineCode> or <InlineCode>aria-label</InlineCode> /{' '}
              <InlineCode>aria-labelledby</InlineCode> is required; leading and trailing icons are
              decorative and hidden from assistive tech.
            </li>
            <li>
              Tab moves focus to the input; pressing anywhere in the container (except an icon
              button) focuses it too.
            </li>
            <li>
              Supporting text is exposed as the field&apos;s description. When the field is invalid
              the error message is shown in its place, but the supporting text stays in the
              accessible description (<InlineCode>sr-only</InlineCode>).
            </li>
            <li>
              The error message has the <InlineCode>alert</InlineCode> role, so it is announced as
              it appears. While invalid, the field shows an error icon named &quot;Error&quot; (
              <InlineCode>labels.error</InlineCode>; <InlineCode>errorIcon</InlineCode> replaces it
              or <InlineCode>false</InlineCode> turns it off), and the supporting text takes the
              error colour.
            </li>
            <li>
              The character counter is read as &quot;Character count: 12 of 80&quot; (
              <InlineCode>labels.characterCount</InlineCode>), and the prefix and suffix join the
              description, read as <InlineCode>prefixLabel</InlineCode> /{' '}
              <InlineCode>suffixLabel</InlineCode> when given (&quot;US dollars&quot; for
              &quot;$&quot;).
            </li>
            <li>
              A read-only field looks like a regular one and gets{' '}
              <InlineCode>data-readonly</InlineCode>; say &quot;Read-only&quot; in its supporting
              text, as M3 asks.
            </li>
            <li>
              <InlineCode>required</InlineCode> adds a <InlineCode>*</InlineCode> that is part of
              the accessible name (M3: &quot;The accessibility label must include the
              asterisk&quot;) and <InlineCode>aria-required</InlineCode>; validation uses React Aria{' '}
              <InlineCode>useTextField</InlineCode> (<InlineCode>validate</InlineCode>,{' '}
              <InlineCode>invalid</InlineCode> and native constraints).
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
              Values come from Compose&apos;s <InlineCode>TextFieldImpl.kt</InlineCode> and the
              token files: a 56px minimum height, a 280px default width, 16px padding that drops to
              4px next to an icon (icons sit in 48px boxes).
            </li>
            <li>
              Colours follow a single computed <InlineCode>data-field-state</InlineCode> (
              <InlineCode>
                disabled &gt; error-focus &gt; error-hover &gt; error &gt; focus &gt; hover &gt;
                rest
              </InlineCode>
              ), so the parts never compete on CSS order; <InlineCode>data-floated</InlineCode> and
              friends are exposed too.
            </li>
            <li>
              The floating label is an absolutely positioned <InlineCode>&lt;label&gt;</InlineCode>{' '}
              that transitions <InlineCode>top</InlineCode>,{' '}
              <InlineCode>inset-inline-start</InlineCode> and the type scale, so it needs no
              transforms and mirrors in RTL (it also floats for browser autofill).
            </li>
            <li>
              The outlined notch is a hidden <InlineCode>fieldset</InlineCode> /{' '}
              <InlineCode>legend</InlineCode> carrying the label text, so the gap matches the label
              exactly. With a label the placeholder, prefix and suffix appear only once it floats.
            </li>
            <li>
              <InlineCode>multiline</InlineCode> is a fixed-height text area by default, which M3
              recommends over growing fields on the web; <InlineCode>autoGrow</InlineCode> gives
              Compose&apos;s growing field. <InlineCode>supportingTextOnFocus</InlineCode> shows the
              supporting text only while the field has focus.
            </li>
            <li>
              Select and Autocomplete draw the same field, so the text field&apos;s component tokens
              (<InlineCode>--md-comp-filled-text-field-*</InlineCode>,{' '}
              <InlineCode>--md-comp-outlined-text-field-*</InlineCode>) restyle them too. M3&apos;s
              separate <InlineCode>filled-select</InlineCode> and{' '}
              <InlineCode>filled-autocomplete</InlineCode> token sets aren&apos;t exposed.
            </li>
            <li>
              <strong>Not yet supported:</strong> the composable TextField parts (the &quot;two API
              levels&quot;); only the batteries-included form is exported, built from the Field
              primitives.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
