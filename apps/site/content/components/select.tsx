import { ExampleViewer } from '../../components/example-viewer';
import { SelectBasic } from '../../examples/select/select-basic';
import { SelectMultiple } from '../../examples/select/select-multiple';
import { SelectSearchable } from '../../examples/select/select-searchable';
import { SelectVariants } from '../../examples/select/select-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const EXAMPLES = [
  { file: 'select-basic.tsx', title: 'One choice', Example: SelectBasic },
  {
    file: 'select-variants.tsx',
    title: 'Filled and outlined, with states',
    Example: SelectVariants,
  },
  { file: 'select-multiple.tsx', title: 'Several choices', Example: SelectMultiple },
  {
    file: 'select-searchable.tsx',
    title: 'A long list, with a search',
    Example: SelectSearchable,
  },
];

/** Select page body: purpose, examples, accessibility and differences from Compose. */
export async function SelectBody() {
  const sources = await Promise.all(
    EXAMPLES.map((example) => readExampleSource(`select/${example.file}`)),
  );
  const highlighted = await Promise.all(sources.map((source) => highlightSource(source)));

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A select is M3&apos;s <strong className="text-on-surface">exposed dropdown menu</strong>{' '}
          in its read-only form: a field that opens a menu of options and shows the chosen one. Use
          it for one choice (or a few) from a short, known list, such as a sort order or a currency.
          For a long list, or options from a server, use an{' '}
          <code className="text-on-surface">Autocomplete</code>; for up to about five options that
          should all stay visible, a <code className="text-on-surface">RadioGroup</code>; for
          actions rather than a value, a <code className="text-on-surface">Menu</code>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Options are <code className="text-on-surface">SelectItem</code>s, optionally in{' '}
          <code className="text-on-surface">SelectSection</code>s, identified by a React{' '}
          <code className="text-on-surface">key</code>, or built from{' '}
          <code className="text-on-surface">items</code> with a render function. Create them in a
          client component. <code className="text-on-surface">name</code> submits the chosen key
          with a form, through a hidden native select that browsers can autofill.
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
        <h2 className="text-headline-small text-on-surface">Selection, items and forms</h2>
        <p className="text-body-large text-on-surface-variant">
          These props come from React Aria, so the table above doesn&apos;t list them.
        </p>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">selectionMode</code>:{' '}
            <code className="text-on-surface">&quot;single&quot;</code> (default) or{' '}
            <code className="text-on-surface">&quot;multiple&quot;</code>.{' '}
            <code className="text-on-surface">value</code> /{' '}
            <code className="text-on-surface">defaultValue</code> /{' '}
            <code className="text-on-surface">onChange</code> take a key (or{' '}
            <code className="text-on-surface">null</code>), or an array of keys when multiple.
          </li>
          <li>
            <code className="text-on-surface">items</code> with a render function as children, or{' '}
            <code className="text-on-surface">SelectItem</code>s written out;{' '}
            <code className="text-on-surface">disabledKeys</code> disables options.
          </li>
          <li>
            <code className="text-on-surface">defaultOpen</code> and{' '}
            <code className="text-on-surface">onOpenChange</code>, with{' '}
            <code className="text-on-surface">open</code> above, control the menu.
          </li>
          <li>
            <code className="text-on-surface">name</code> and{' '}
            <code className="text-on-surface">form</code> for forms;{' '}
            <code className="text-on-surface">validate</code> and{' '}
            <code className="text-on-surface">validationBehavior</code> as in Text field;{' '}
            <code className="text-on-surface">autoFocus</code>,{' '}
            <code className="text-on-surface">onFocus</code>,{' '}
            <code className="text-on-surface">onBlur</code>.
          </li>
          <li>
            <code className="text-on-surface">placeholder</code>, shown in the field when nothing is
            chosen; <code className="text-on-surface">autoComplete</code> for the hidden select
            browsers fill.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The field is a button with <code className="text-on-surface">aria-haspopup</code> and{' '}
            <code className="text-on-surface">aria-expanded</code>, named by its label and its
            value. Enter, Space or the arrow keys open the menu; ↑ / ↓ move, typing jumps to a
            match, Enter chooses and Escape closes. Focus returns to the field.
          </li>
          <li>
            Typing on the closed field jumps straight to a matching option, as a native select does.
          </li>
          <li>
            Supporting text is the field&apos;s description; an error replaces it visually and is
            announced, while the supporting text stays in the description.
          </li>
          <li>
            With <code className="text-on-surface">selectionMode=&quot;multiple&quot;</code> the
            menu stays open between picks. Options past{' '}
            <code className="text-on-surface">maxSelections</code> are disabled until one is
            removed.
          </li>
          <li>
            A <code className="text-on-surface">searchable</code> field opens a dialog named by its
            label. Its search is a combobox: typing filters the options, ↑ / ↓ move through them
            while focus stays in the search, Enter chooses, and Escape clears the search, then
            closes. In a menu the search takes focus; a sheet shows the list first, so the keyboard
            doesn&apos;t cover it, and a tap on the search starts typing. &quot;No results&quot; is
            announced.
          </li>
          <li>
            With <code className="text-on-surface">renderValue</code> the field shows what you
            render (a code, a flag), while screen readers still hear the chosen options&apos; text.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The field is the library&apos;s Text field (filled by default, or outlined) and the list
            is its Menu, so neither can drift: Compose&apos;s{' '}
            <code className="text-on-surface">ExposedDropdownMenuBox</code> with a{' '}
            <code className="text-on-surface">PrimaryNotEditable</code> anchor. The menu is as wide
            as the field, and the arrow turns over while it&apos;s open.
          </li>
          <li>
            <code className="text-on-surface">presentation</code> adds what Compose leaves to apps:{' '}
            <code className="text-on-surface">&quot;sheet&quot;</code> opens the options in a bottom
            sheet, and <code className="text-on-surface">&quot;auto&quot;</code> does so on compact
            windows only. The default, <code className="text-on-surface">&quot;menu&quot;</code>, is
            M3&apos;s baseline on every window.
          </li>
          <li>
            Multiple selection and <code className="text-on-surface">maxSelections</code>, which
            Compose&apos;s exposed dropdown doesn&apos;t have.
          </li>
          <li>
            <code className="text-on-surface">searchable</code>: M3 doesn&apos;t define a search
            inside a menu, so it&apos;s built from M3 parts. The search is the M3 search bar&apos;s
            field at 48px, M3&apos;s minimum touch target, rather than the bar&apos;s 56px, so it
            doesn&apos;t dominate the 44px rows; it filters ignoring case and accents, and{' '}
            <code className="text-on-surface">filter</code> or{' '}
            <code className="text-on-surface">onSearchChange</code> (for server results) replace
            that. A searchable menu is at least 280px wide, room to type.
          </li>
        </ul>
      </section>
    </>
  );
}
