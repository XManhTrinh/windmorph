import { ExampleViewer } from '../../components/example-viewer';
import { TextFieldAdornments } from '../../examples/text-field/text-field-adornments';
import { TextFieldMultiline } from '../../examples/text-field/text-field-multiline';
import { TextFieldStates } from '../../examples/text-field/text-field-states';
import { TextFieldVariants } from '../../examples/text-field/text-field-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** TextField page body: purpose, live examples, accessibility and Compose differences. */
export async function TextFieldBody() {
  const [variants, adornments, states, multiline] = await Promise.all([
    readExampleSource('text-field/text-field-variants.tsx'),
    readExampleSource('text-field/text-field-adornments.tsx'),
    readExampleSource('text-field/text-field-states.tsx'),
    readExampleSource('text-field/text-field-multiline.tsx'),
  ]);
  const [variantsHtml, adornmentsHtml, statesHtml, multilineHtml] = await Promise.all([
    highlightSource(variants),
    highlightSource(adornments),
    highlightSource(states),
    highlightSource(multiline),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Text fields let people enter and edit text. Reach for one for free-form input like a name,
          email or message; use a <code className="text-on-surface">Select</code>,{' '}
          <code className="text-on-surface">RadioGroup</code> or{' '}
          <code className="text-on-surface">Checkbox</code> when the choices are fixed.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Every field needs a name: pass a visible <code className="text-on-surface">label</code>{' '}
          or, when the context already makes the purpose clear, an{' '}
          <code className="text-on-surface">aria-label</code> /{' '}
          <code className="text-on-surface">aria-labelledby</code> (the types enforce one). The
          value is controlled through <code className="text-on-surface">value</code> /{' '}
          <code className="text-on-surface">onChange(value)</code> or left uncontrolled with{' '}
          <code className="text-on-surface">defaultValue</code>.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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
          title="Multiline with character counter"
          code={multiline}
          html={multilineHtml}
          fileName="text-field-multiline.tsx"
        >
          <TextFieldMultiline />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A <code className="text-on-surface">label</code> or{' '}
            <code className="text-on-surface">aria-label</code> /{' '}
            <code className="text-on-surface">aria-labelledby</code> is required; leading and
            trailing icons are decorative and hidden from assistive tech.
          </li>
          <li>
            Tab moves focus to the input; pressing anywhere in the container (except an icon button)
            focuses it too.
          </li>
          <li>
            Supporting text is exposed as the field&apos;s description. When the field is invalid
            the error message is shown in its place, but the supporting text stays in the accessible
            description (<code className="text-on-surface">sr-only</code>).
          </li>
          <li>
            <code className="text-on-surface">required</code> adds a visual{' '}
            <code className="text-on-surface">*</code> and{' '}
            <code className="text-on-surface">aria-required</code>; validation uses React Aria{' '}
            <code className="text-on-surface">useTextField</code> (
            <code className="text-on-surface">validate</code>,{' '}
            <code className="text-on-surface">invalid</code> and native constraints).
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Values come from Compose&apos;s{' '}
            <code className="text-on-surface">TextFieldImpl.kt</code> and the token files: a 56px
            minimum height, a 280px default width, 16px padding that drops to 4px next to an icon
            (icons sit in 48px boxes).
          </li>
          <li>
            Colours follow a single computed{' '}
            <code className="text-on-surface">data-field-state</code> (
            <code className="text-on-surface">
              disabled &gt; error-focus &gt; error-hover &gt; error &gt; focus &gt; hover &gt; rest
            </code>
            ), so the parts never compete on CSS order;{' '}
            <code className="text-on-surface">data-floated</code> and friends are exposed too.
          </li>
          <li>
            The floating label is an absolutely positioned{' '}
            <code className="text-on-surface">&lt;label&gt;</code> that transitions{' '}
            <code className="text-on-surface">top</code>,{' '}
            <code className="text-on-surface">inset-inline-start</code> and the type scale, so it
            needs no transforms and mirrors in RTL (it also floats for browser autofill).
          </li>
          <li>
            The outlined notch is a hidden <code className="text-on-surface">fieldset</code> /{' '}
            <code className="text-on-surface">legend</code> carrying the label text, so the gap
            matches the label exactly. With a label the placeholder, prefix and suffix appear only
            once it floats.
          </li>
          <li>
            <strong>Not in v1:</strong> the composable TextField parts (the &quot;two API
            levels&quot;); only the batteries-included form is exported, built from the Field
            primitives.
          </li>
        </ul>
      </section>
    </>
  );
}
