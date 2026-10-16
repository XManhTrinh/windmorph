import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const PhoneFieldDensity = lazyExample('phone-field/phone-field-density', 'PhoneFieldDensity');
const PhoneFieldFlags = lazyExample('phone-field/phone-field-flags', 'PhoneFieldFlags');
const PhoneFieldSignup = lazyExample('phone-field/phone-field-signup', 'PhoneFieldSignup');
const PhoneFieldStates = lazyExample('phone-field/phone-field-states', 'PhoneFieldStates');
const PhoneFieldVariants = lazyExample('phone-field/phone-field-variants', 'PhoneFieldVariants');

/** Phone field page body: purpose, examples and theming. */
export async function PhoneFieldBody(): Promise<ComponentDoc> {
  const [signup, variants, flags, states, density] = await Promise.all([
    readExampleSource('phone-field/phone-field-signup.tsx'),
    readExampleSource('phone-field/phone-field-variants.tsx'),
    readExampleSource('phone-field/phone-field-flags.tsx'),
    readExampleSource('phone-field/phone-field-states.tsx'),
    readExampleSource('phone-field/phone-field-density.tsx'),
  ]);
  const [signupHtml, variantsHtml, flagsHtml, statesHtml, densityHtml] = await Promise.all([
    highlightSource(signup),
    highlightSource(variants),
    highlightSource(flags),
    highlightSource(states),
    highlightSource(density),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="An optional phone at sign-up"
            code={signup}
            html={signupHtml}
            fileName="phone-field-signup.tsx"
          >
            <PhoneFieldSignup />
          </ExampleViewer>
          <ExampleViewer
            title="Outlined or filled"
            code={variants}
            html={variantsHtml}
            fileName="phone-field-variants.tsx"
          >
            <PhoneFieldVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Flags, when the app wants them"
            code={flags}
            html={flagsHtml}
            fileName="phone-field-flags.tsx"
          >
            <PhoneFieldFlags />
          </ExampleViewer>
          <ExampleViewer
            title="Required, read-only, disabled, and another locale"
            code={states}
            html={statesHtml}
            fileName="phone-field-states.tsx"
          >
            <PhoneFieldStates />
          </ExampleViewer>
          <ExampleViewer
            title="Density, from 56px to 44px"
            code={density}
            html={densityHtml}
            fileName="phone-field-density.tsx"
          >
            <PhoneFieldDensity />
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
            A phone field takes a phone number with its country: people pick their country (or a
            pasted or autofilled <InlineCode>+…</InlineCode> number picks it), type the number in
            their country&apos;s usual format, and the app gets one international{' '}
            <InlineCode>E.164</InlineCode> value such as <InlineCode>+447911123456</InlineCode>. It
            is <strong className="text-on-surface">not an M3 component</strong>: it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>, and its number is the library&apos;s Text
            field.
          </p>
          <p className="text-body-large text-on-surface-variant">
            The phone rules come from <InlineCode>libphonenumber-js</InlineCode> (Google&apos;s
            phone data), loaded only on pages that use the field. Country names come from the
            browser in the page&apos;s language, so no names ship with the library. Servers can
            check a value the same way with <InlineCode>phoneProblem</InlineCode>.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Both fields are one <InlineCode>group</InlineCode>, named by the{' '}
              <InlineCode>label</InlineCode>. Each country reads as its name and its dialling code
              as shown (&quot;United Kingdom, +44&quot;), so the country field&apos;s name contains
              the code people see.
            </li>
            <li>
              <InlineCode>density</InlineCode> (or the theme&apos;s, through a provider or{' '}
              <InlineCode>ThemeScope</InlineCode>) takes 4px a step off both fields and the country
              list&apos;s rows, from 56px at 0 to 44px at -3, as the core&apos;s fields do.
            </li>
            <li>
              The field is 20rem wide: 320px at the default text size and at least 320px, so it
              grows with larger text and the number&apos;s label is never cut short at 200%.
            </li>
            <li>
              <InlineCode>readOnly</InlineCode> makes the number read-only and keeps the country
              field enabled: it shows its country but doesn&apos;t open.
            </li>
            <li>
              An invalid number shows the core&apos;s error icon once, on the number; the country
              field turns its own off, so it keeps its width.
            </li>
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
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The phone field has no values of its own to override: its parts take the core&apos;s
              Text field, Select, search and menu tokens, so a theme for those reaches it. Its root
              is marked <InlineCode>data-tokens=&quot;wm-phone-field&quot;</InlineCode>.
            </li>
            <li>
              The country field is a Select, so it has the Text field&apos;s tokens in both
              variants: the <InlineCode>outline</InlineCode> or filled container, 2px{' '}
              <InlineCode>primary</InlineCode> when focused or open, and{' '}
              <InlineCode>error</InlineCode> when the number is invalid.
            </li>
            <li>
              The search is the M3 search bar&apos;s field at 48px (M3&apos;s minimum touch target,
              so it doesn&apos;t dominate the 44px rows), with full corners,{' '}
              <InlineCode>surface-container-high</InlineCode>, and the focus ring for keyboard focus
              only.
            </li>
            <li>
              The list is the one Select and Autocomplete use: the M3 menu&apos;s{' '}
              <InlineCode>surface-container-low</InlineCode> panel at elevation 2, with the chosen
              country in <InlineCode>tertiary-container</InlineCode> with a check, and state layers
              for hover and keyboard focus.
            </li>
            <li>
              <InlineCode>classNames</InlineCode> reaches every part: the{' '}
              <InlineCode>root</InlineCode> group; the country field&apos;s{' '}
              <InlineCode>country</InlineCode> root, <InlineCode>countryContainer</InlineCode> and{' '}
              <InlineCode>countryValue</InlineCode>; the list&apos;s <InlineCode>picker</InlineCode>{' '}
              surface, <InlineCode>pickerSheet</InlineCode> (phones),{' '}
              <InlineCode>pickerSearch</InlineCode>, <InlineCode>pickerOption</InlineCode> and{' '}
              <InlineCode>pickerHeading</InlineCode>; and the number&apos;s{' '}
              <InlineCode>number</InlineCode> root, <InlineCode>numberContainer</InlineCode>,{' '}
              <InlineCode>label</InlineCode>, <InlineCode>input</InlineCode> (the real{' '}
              <InlineCode>{'<input>'}</InlineCode>), <InlineCode>supportingText</InlineCode> and{' '}
              <InlineCode>errorText</InlineCode>.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
