import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const AutocompleteAsync = lazyExample('autocomplete/autocomplete-async', 'AutocompleteAsync');
const AutocompleteBasic = lazyExample('autocomplete/autocomplete-basic', 'AutocompleteBasic');
const AutocompleteMultiple = lazyExample(
  'autocomplete/autocomplete-multiple',
  'AutocompleteMultiple',
);
const AutocompleteSections = lazyExample(
  'autocomplete/autocomplete-sections',
  'AutocompleteSections',
);
const AutocompleteDensityExample = lazyExample(
  'autocomplete/autocomplete-density',
  'AutocompleteDensity',
);

/** Autocomplete page body: purpose, examples, accessibility and differences from Compose. */
export async function AutocompleteBody(): Promise<ComponentDoc> {
  const [basic, multiple, sections, fromServer] = await Promise.all([
    readExampleSource('autocomplete/autocomplete-basic.tsx'),
    readExampleSource('autocomplete/autocomplete-multiple.tsx'),
    readExampleSource('autocomplete/autocomplete-sections.tsx'),
    readExampleSource('autocomplete/autocomplete-async.tsx'),
  ]);
  const [basicHtml, multipleHtml, sectionsHtml, fromServerHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(multiple),
    highlightSource(sections),
    highlightSource(fromServer),
  ]);

  const densitySource = await readExampleSource('autocomplete/autocomplete-density.tsx');
  const densityHtml = await highlightSource(densitySource);
  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Type to find"
            code={basic}
            html={basicHtml}
            fileName="autocomplete-basic.tsx"
          >
            <AutocompleteBasic />
          </ExampleViewer>
          <ExampleViewer
            title="Several choices as input chips"
            code={multiple}
            html={multipleHtml}
            fileName="autocomplete-multiple.tsx"
          >
            <AutocompleteMultiple />
          </ExampleViewer>
          <ExampleViewer
            title="Grouped in sections"
            code={sections}
            html={sectionsHtml}
            fileName="autocomplete-sections.tsx"
          >
            <AutocompleteSections />
          </ExampleViewer>
          <ExampleViewer
            title="Options from a server"
            code={fromServer}
            html={fromServerHtml}
            fileName="autocomplete-async.tsx"
          >
            <AutocompleteAsync />
          </ExampleViewer>
          <ExampleViewer
            title="Density"
            code={densitySource}
            html={densityHtml}
            fileName="autocomplete-density.tsx"
          >
            <AutocompleteDensityExample />
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
            An autocomplete is M3&apos;s{' '}
            <strong className="text-on-surface">exposed dropdown menu</strong> in its editable form:
            type in the field and the menu below it shows the matching options. Use it when typing
            finds an option faster than scrolling: countries, cities, categories, or options loaded
            from a server. For a short list, use a <InlineCode>Select</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Matching ignores case and accents by default (&quot;zurich&quot; finds
            &quot;Zürich&quot;), anywhere in the option&apos;s text; <InlineCode>filter</InlineCode>{' '}
            replaces it. For server results, control <InlineCode>items</InlineCode> and{' '}
            <InlineCode>inputValue</InlineCode> and set <InlineCode>loading</InlineCode> while they
            load. <InlineCode>allowsCustomValue</InlineCode> keeps text that matches no option.
            Options are <InlineCode>AutocompleteItem</InlineCode>s (and{' '}
            <InlineCode>AutocompleteSection</InlineCode>s), created in a client component.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="selection-items-and-forms" className="text-headline-small text-on-surface">
            Selection, items and forms
          </h2>
          <p className="text-body-large text-on-surface-variant">
            These props come from React Aria, so the table above doesn&apos;t list them.
          </p>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>selectionMode</InlineCode>: <InlineCode>&quot;single&quot;</InlineCode>{' '}
              (default) or <InlineCode>&quot;multiple&quot;</InlineCode>.{' '}
              <InlineCode>value</InlineCode> / <InlineCode>defaultValue</InlineCode> /{' '}
              <InlineCode>onChange</InlineCode> take a key (or <InlineCode>null</InlineCode>), or an
              array of keys when multiple.
            </li>
            <li>
              <InlineCode>defaultItems</InlineCode> (filtered for you) or{' '}
              <InlineCode>items</InlineCode> (filtered by you) with a render function as children,
              or <InlineCode>AutocompleteItem</InlineCode>s written out;{' '}
              <InlineCode>disabledKeys</InlineCode> disables options.
            </li>
            <li>
              <InlineCode>onOpenChange</InlineCode> reports when the menu opens and closes.
            </li>
            <li>
              <InlineCode>name</InlineCode> and <InlineCode>form</InlineCode> for forms;{' '}
              <InlineCode>validate</InlineCode> and <InlineCode>validationBehavior</InlineCode> as
              in Text field; <InlineCode>autoFocus</InlineCode>, <InlineCode>onFocus</InlineCode>,{' '}
              <InlineCode>onBlur</InlineCode>.
            </li>
            <li>
              <InlineCode>inputValue</InlineCode> / <InlineCode>defaultInputValue</InlineCode> /{' '}
              <InlineCode>onInputChange</InlineCode> for the typed text;{' '}
              <InlineCode>placeholder</InlineCode>.
            </li>
            <li>
              <InlineCode>allowsCustomValue</InlineCode> keeps text that matches no option;{' '}
              <InlineCode>menuTrigger</InlineCode> (<InlineCode>&quot;input&quot;</InlineCode> by
              default, <InlineCode>&quot;focus&quot;</InlineCode> or{' '}
              <InlineCode>&quot;manual&quot;</InlineCode>) sets when the menu opens. Pressing the
              field opens every option, as M3 asks, unless it is{' '}
              <InlineCode>&quot;manual&quot;</InlineCode>.
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
              Compose&apos;s <InlineCode>ExposedDropdownMenuBox</InlineCode> with a{' '}
              <InlineCode>PrimaryEditable</InlineCode> anchor leaves filtering to the app; here
              it&apos;s built in, accent-insensitive, and replaceable.
            </li>
            <li>
              The menu always opens under the field (above it when there&apos;s no room), never in a
              sheet, so the text being typed stays visible.
            </li>
            <li>
              Multiple selection as M3 input chips, with <InlineCode>maxSelections</InlineCode>,
              which Compose&apos;s exposed dropdown doesn&apos;t have.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
