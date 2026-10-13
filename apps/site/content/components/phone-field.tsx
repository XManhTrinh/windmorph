import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { PhoneFieldFlags } from '../../examples/phone-field/phone-field-flags';
import { PhoneFieldSignup } from '../../examples/phone-field/phone-field-signup';
import { PhoneFieldVariants } from '../../examples/phone-field/phone-field-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

const EXAMPLES = [
  {
    file: 'phone-field-signup.tsx',
    title: 'An optional phone at sign-up',
    Example: PhoneFieldSignup,
  },
  { file: 'phone-field-variants.tsx', title: 'Outlined or filled', Example: PhoneFieldVariants },
  {
    file: 'phone-field-flags.tsx',
    title: 'Flags, when the app wants them',
    Example: PhoneFieldFlags,
  },
];

/** Phone field page body: purpose, examples, accessibility and theming. */
export async function PhoneFieldBody(): Promise<ComponentDoc> {
  const sources = await Promise.all(
    EXAMPLES.map((example) => readExampleSource(`phone-field/${example.file}`)),
  );
  const highlighted = await Promise.all(sources.map((source) => highlightSource(source)));

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          {EXAMPLES.map(({ file, title, Example }, index) => (
            <ExampleViewer
              key={file}
              title={title}
              code={sources[index]!}
              html={highlighted[index]!}
              fileName={file}
            >
              <Example />
            </ExampleViewer>
          ))}
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
              The country field is a searchable Select, named by the country and its code, then its
              label (&quot;United Kingdom (+44) Country&quot;); it opens a dialog with the search
              and the list.
            </li>
            <li>
              The search keeps focus: type a name, ISO code or dialling code (&quot;thai&quot;,
              &quot;TH&quot;, &quot;66&quot;), move with the arrow keys, press Enter to choose, or
              Escape to clear the search and then close. Focus then returns to the country field,
              with the number next; a press outside leaves it.
            </li>
            <li>
              The number uses <InlineCode>type=&quot;tel&quot;</InlineCode>, the phone keypad and{' '}
              <InlineCode>autocomplete=&quot;tel&quot;</InlineCode>, so browsers can fill the whole
              number. An invalid number is announced when the field loses focus.
            </li>
            <li>
              On compact windows the list opens in a bottom sheet, showing the list first so the
              keyboard doesn&apos;t cover it; on larger ones, in a menu under the field with the
              search focused. The dial code and the number read left to right in right-to-left
              layouts.
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
          </ul>
        </section>
      </>
    ),
  };
}
