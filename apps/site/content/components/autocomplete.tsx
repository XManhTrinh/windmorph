import { ExampleViewer } from '../../components/example-viewer';
import { AutocompleteAsync } from '../../examples/autocomplete/autocomplete-async';
import { AutocompleteBasic } from '../../examples/autocomplete/autocomplete-basic';
import { AutocompleteMultiple } from '../../examples/autocomplete/autocomplete-multiple';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const EXAMPLES = [
  { file: 'autocomplete-basic.tsx', title: 'Type to find', Example: AutocompleteBasic },
  {
    file: 'autocomplete-multiple.tsx',
    title: 'Several choices as input chips',
    Example: AutocompleteMultiple,
  },
  { file: 'autocomplete-async.tsx', title: 'Options from a server', Example: AutocompleteAsync },
];

/** Autocomplete page body: purpose, examples, accessibility and differences from Compose. */
export async function AutocompleteBody() {
  const sources = await Promise.all(
    EXAMPLES.map((example) => readExampleSource(`autocomplete/${example.file}`)),
  );
  const highlighted = await Promise.all(sources.map((source) => highlightSource(source)));

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          An autocomplete is M3&apos;s{' '}
          <strong className="text-on-surface">exposed dropdown menu</strong> in its editable form:
          type in the field and the menu below it shows the matching options. Use it when typing
          finds an option faster than scrolling: countries, cities, categories, or options loaded
          from a server. For a short list, use a <code className="text-on-surface">Select</code>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Matching ignores case and accents by default (&quot;zurich&quot; finds
          &quot;Zürich&quot;), anywhere in the option&apos;s text;{' '}
          <code className="text-on-surface">filter</code> replaces it. For server results, control{' '}
          <code className="text-on-surface">items</code> and{' '}
          <code className="text-on-surface">inputValue</code> and set{' '}
          <code className="text-on-surface">loading</code> while they load.{' '}
          <code className="text-on-surface">allowsCustomValue</code> keeps text that matches no
          option. Options are <code className="text-on-surface">AutocompleteItem</code>s (and{' '}
          <code className="text-on-surface">AutocompleteSection</code>s), created in a client
          component.
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
            <code className="text-on-surface">defaultItems</code> (filtered for you) or{' '}
            <code className="text-on-surface">items</code> (filtered by you) with a render function
            as children, or <code className="text-on-surface">AutocompleteItem</code>s written out;{' '}
            <code className="text-on-surface">disabledKeys</code> disables options.
          </li>
          <li>
            <code className="text-on-surface">onOpenChange</code> reports when the menu opens and
            closes.
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
            <code className="text-on-surface">inputValue</code> /{' '}
            <code className="text-on-surface">defaultInputValue</code> /{' '}
            <code className="text-on-surface">onInputChange</code> for the typed text;{' '}
            <code className="text-on-surface">placeholder</code>.
          </li>
          <li>
            <code className="text-on-surface">allowsCustomValue</code> keeps text that matches no
            option; <code className="text-on-surface">menuTrigger</code> (
            <code className="text-on-surface">&quot;input&quot;</code> by default,{' '}
            <code className="text-on-surface">&quot;focus&quot;</code> or{' '}
            <code className="text-on-surface">&quot;manual&quot;</code>) sets when the menu opens.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The field is a <code className="text-on-surface">combobox</code> with list autocomplete.
            Typing opens the menu and filters it; ↑ / ↓ move through the matches while focus stays
            in the field (<code className="text-on-surface">aria-activedescendant</code>), Enter
            chooses, and Escape closes the menu, then clears the text.
          </li>
          <li>
            The arrow button opens every option and is named &quot;Show options&quot; (set{' '}
            <code className="text-on-surface">labels</code> for other languages). &quot;No
            results&quot; and the loading indicator are announced.
          </li>
          <li>
            With <code className="text-on-surface">selectionMode=&quot;multiple&quot;</code>, each
            chosen option is an input chip whose close button is named &quot;Remove&quot; with the
            option; Backspace in the empty field removes the last one. While the menu is open, only
            the field and the menu are exposed to assistive technology, so Escape first.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Compose&apos;s <code className="text-on-surface">ExposedDropdownMenuBox</code> with a{' '}
            <code className="text-on-surface">PrimaryEditable</code> anchor leaves filtering to the
            app; here it&apos;s built in, accent-insensitive, and replaceable.
          </li>
          <li>
            The menu always opens under the field (above it when there&apos;s no room), never in a
            sheet, so the text being typed stays visible.
          </li>
          <li>
            Multiple selection as M3 input chips, with{' '}
            <code className="text-on-surface">maxSelections</code>, which Compose&apos;s exposed
            dropdown doesn&apos;t have.
          </li>
        </ul>
      </section>
    </>
  );
}
