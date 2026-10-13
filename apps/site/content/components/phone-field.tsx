import { ExampleViewer } from '../../components/example-viewer';
import { PhoneFieldFlags } from '../../examples/phone-field/phone-field-flags';
import { PhoneFieldSignup } from '../../examples/phone-field/phone-field-signup';
import { PhoneFieldVariants } from '../../examples/phone-field/phone-field-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

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
export async function PhoneFieldBody() {
  const sources = await Promise.all(
    EXAMPLES.map((example) => readExampleSource(`phone-field/${example.file}`)),
  );
  const highlighted = await Promise.all(sources.map((source) => highlightSource(source)));

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A phone field takes a phone number with its country: people pick their country (or a
          pasted or autofilled <code className="text-on-surface">+…</code> number picks it), type
          the number in their country&apos;s usual format, and the app gets one international{' '}
          <code className="text-on-surface">E.164</code> value such as{' '}
          <code className="text-on-surface">+447911123456</code>. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>: it comes from{' '}
          <code className="text-on-surface">@windmorph/react-pro</code>, and its number is the
          library&apos;s Text field.
        </p>
        <p className="text-body-large text-on-surface-variant">
          The phone rules come from <code className="text-on-surface">libphonenumber-js</code>{' '}
          (Google&apos;s phone data), loaded only on pages that use the field. Country names come
          from the browser in the page&apos;s language, so no names ship with the library. Servers
          can check a value the same way with <code className="text-on-surface">phoneProblem</code>.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The country field is a searchable Select, named by the country and its code, then its
            label (&quot;United Kingdom (+44) Country&quot;); it opens a dialog with the search and
            the list.
          </li>
          <li>
            The search keeps focus: type a name, ISO code or dialling code (&quot;thai&quot;,
            &quot;TH&quot;, &quot;66&quot;), move with the arrow keys, press Enter to choose, or
            Escape to clear the search and then close. Focus then returns to the country field, with
            the number next; a press outside leaves it.
          </li>
          <li>
            The number uses <code className="text-on-surface">type=&quot;tel&quot;</code>, the phone
            keypad and <code className="text-on-surface">autocomplete=&quot;tel&quot;</code>, so
            browsers can fill the whole number. An invalid number is announced when the field loses
            focus.
          </li>
          <li>
            On compact windows the list opens in a bottom sheet, showing the list first so the
            keyboard doesn&apos;t cover it; on larger ones, in a menu under the field with the
            search focused. The dial code and the number read left to right in right-to-left
            layouts.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The country field is a Select, so it has the Text field&apos;s tokens in both variants:
            the <code className="text-on-surface">outline</code> or filled container, 2px{' '}
            <code className="text-on-surface">primary</code> when focused or open, and{' '}
            <code className="text-on-surface">error</code> when the number is invalid.
          </li>
          <li>
            The search is the M3 search bar&apos;s field at 48px (M3&apos;s minimum touch target, so
            it doesn&apos;t dominate the 44px rows), with full corners,{' '}
            <code className="text-on-surface">surface-container-high</code>, and the focus ring for
            keyboard focus only.
          </li>
          <li>
            The list is the one Select and Autocomplete use: the M3 menu&apos;s{' '}
            <code className="text-on-surface">surface-container-low</code> panel at elevation 2,
            with the chosen country in <code className="text-on-surface">tertiary-container</code>{' '}
            with a check, and state layers for hover and keyboard focus.
          </li>
        </ul>
      </section>
    </>
  );
}
