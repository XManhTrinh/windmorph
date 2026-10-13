import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const SelectBasic = lazyExample('select/select-basic', 'SelectBasic');
const SelectMultiple = lazyExample('select/select-multiple', 'SelectMultiple');
const SelectSearchable = lazyExample('select/select-searchable', 'SelectSearchable');
const SelectVariants = lazyExample('select/select-variants', 'SelectVariants');

/** Select page body: purpose, examples, accessibility and differences from Compose. */
export async function SelectBody(): Promise<ComponentDoc> {
  const [basic, variants, multiple, searchable] = await Promise.all([
    readExampleSource('select/select-basic.tsx'),
    readExampleSource('select/select-variants.tsx'),
    readExampleSource('select/select-multiple.tsx'),
    readExampleSource('select/select-searchable.tsx'),
  ]);
  const [basicHtml, variantsHtml, multipleHtml, searchableHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(variants),
    highlightSource(multiple),
    highlightSource(searchable),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="One choice"
            code={basic}
            html={basicHtml}
            fileName="select-basic.tsx"
          >
            <SelectBasic />
          </ExampleViewer>
          <ExampleViewer
            title="Filled and outlined, with states"
            code={variants}
            html={variantsHtml}
            fileName="select-variants.tsx"
          >
            <SelectVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Several choices"
            code={multiple}
            html={multipleHtml}
            fileName="select-multiple.tsx"
          >
            <SelectMultiple />
          </ExampleViewer>
          <ExampleViewer
            title="A long list, with a search"
            code={searchable}
            html={searchableHtml}
            fileName="select-searchable.tsx"
          >
            <SelectSearchable />
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
            A select is M3&apos;s <strong className="text-on-surface">exposed dropdown menu</strong>{' '}
            in its read-only form: a field that opens a menu of options and shows the chosen one.
            Use it for one choice (or a few) from a short, known list, such as a sort order or a
            currency. For a long list, or options from a server, use an{' '}
            <InlineCode>Autocomplete</InlineCode>; for up to about five options that should all stay
            visible, a <InlineCode>RadioGroup</InlineCode>; for actions rather than a value, a{' '}
            <InlineCode>Menu</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Options are <InlineCode>SelectItem</InlineCode>s, optionally in{' '}
            <InlineCode>SelectSection</InlineCode>s, identified by a React{' '}
            <InlineCode>key</InlineCode>, or built from <InlineCode>items</InlineCode> with a render
            function. Create them in a client component. <InlineCode>name</InlineCode> submits the
            chosen key with a form, through a hidden native select that browsers can autofill.
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
              <InlineCode>items</InlineCode> with a render function as children, or{' '}
              <InlineCode>SelectItem</InlineCode>s written out;{' '}
              <InlineCode>disabledKeys</InlineCode> disables options.
            </li>
            <li>
              <InlineCode>defaultOpen</InlineCode> and <InlineCode>onOpenChange</InlineCode>, with{' '}
              <InlineCode>open</InlineCode> above, control the menu.
            </li>
            <li>
              <InlineCode>name</InlineCode> and <InlineCode>form</InlineCode> for forms;{' '}
              <InlineCode>validate</InlineCode> and <InlineCode>validationBehavior</InlineCode> as
              in Text field; <InlineCode>autoFocus</InlineCode>, <InlineCode>onFocus</InlineCode>,{' '}
              <InlineCode>onBlur</InlineCode>.
            </li>
            <li>
              <InlineCode>placeholder</InlineCode>, shown in the field when nothing is chosen;{' '}
              <InlineCode>autoComplete</InlineCode> for the hidden select browsers fill.
            </li>
          </ul>
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
              The field is a button with <InlineCode>aria-haspopup</InlineCode> and{' '}
              <InlineCode>aria-expanded</InlineCode>, named by its label and its value. Enter, Space
              or the arrow keys open the menu; ↑ / ↓ move, typing jumps to a match (a letter, or the
              same letter again, moves to the next option starting with it, as M3 asks), Enter
              chooses and Escape closes. Focus returns to the field.
            </li>
            <li>
              Typing on the closed field jumps straight to a matching option, as a native select
              does.
            </li>
            <li>
              Supporting text is the field&apos;s description; an error replaces it visually and is
              announced as an alert, while the supporting text stays in the description. An invalid
              field shows an error icon named &quot;Error&quot; before the arrow. The required{' '}
              <InlineCode>*</InlineCode> is part of the field&apos;s name.
            </li>
            <li>
              Disabled options can take keyboard focus but can&apos;t be chosen, as M3 menus ask.
              When the menu opens, focus goes to the chosen option, or the first one: the listbox
              pattern, kept on purpose over M3&apos;s &quot;first item&quot; rule for action menus.
            </li>
            <li>
              <InlineCode>readOnly</InlineCode> shows the choice without opening the menu or
              changing it from the keyboard.
            </li>
            <li>
              With <InlineCode>selectionMode=&quot;multiple&quot;</InlineCode> the menu stays open
              between picks. Options past <InlineCode>maxSelections</InlineCode> are disabled until
              one is removed.
            </li>
            <li>
              A <InlineCode>searchable</InlineCode> field opens a dialog named by its label. Its
              search is a combobox: typing filters the options, ↑ / ↓ move through them while focus
              stays in the search, Enter chooses, and Escape clears the search, then closes. In a
              menu the search takes focus; a sheet shows the list first, so the keyboard
              doesn&apos;t cover it, and a tap on the search starts typing. &quot;No results&quot;
              is announced.
            </li>
            <li>
              With <InlineCode>renderValue</InlineCode> the field shows what you render (a code, a
              flag), while screen readers still hear the chosen options&apos; text.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="building-blocks" className="text-headline-small text-on-surface">
            Building blocks
          </h2>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>OptionPopover</InlineCode> is the popover the options open in, exported for
            building a field of your own on top: it anchors to a trigger, is at least as wide as it,
            flips above it when there&apos;s no room, and opens and closes with the menu&apos;s
            motion. Pass it React Stately&apos;s overlay state and the trigger&apos;s ref;{' '}
            <InlineCode>isNonModal</InlineCode> keeps an input beside it usable, as{' '}
            <InlineCode>Autocomplete</InlineCode> does.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 id="differences-from-compose" className="text-headline-small text-on-surface">
            Differences from Compose
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The field is the library&apos;s Text field (filled by default, or outlined) and the
              list is its Menu, so neither can drift: Compose&apos;s{' '}
              <InlineCode>ExposedDropdownMenuBox</InlineCode> with a{' '}
              <InlineCode>PrimaryNotEditable</InlineCode> anchor. The menu is as wide as the field,
              and the arrow turns over while it&apos;s open. It opens as the Menu does, expanding
              from the field&apos;s edge, rather than Compose&apos;s 80% scale, which the M3 motion
              spec avoids.
            </li>
            <li>
              <InlineCode>presentation</InlineCode> adds what Compose leaves to apps:{' '}
              <InlineCode>&quot;sheet&quot;</InlineCode> opens the options in a bottom sheet, and{' '}
              <InlineCode>&quot;auto&quot;</InlineCode> does so on compact windows only. The
              default, <InlineCode>&quot;menu&quot;</InlineCode>, is M3&apos;s baseline on every
              window.
            </li>
            <li>
              Multiple selection and <InlineCode>maxSelections</InlineCode>, which Compose&apos;s
              exposed dropdown doesn&apos;t have.
            </li>
            <li>
              <InlineCode>searchable</InlineCode>: M3 doesn&apos;t define a search inside a menu, so
              it&apos;s built from M3 parts. The search is the M3 search bar&apos;s field at 48px,
              M3&apos;s minimum touch target, rather than the bar&apos;s 56px, so it doesn&apos;t
              dominate the 44px rows; it filters ignoring case and accents, and{' '}
              <InlineCode>filter</InlineCode> or <InlineCode>onSearchChange</InlineCode> (for server
              results) replace that. A searchable menu is at least 280px wide, room to type.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
