import type { ComponentDoc } from './doc';
import { InlineCode } from '../../components/inline-code';
import { exampleSection } from './example-list';

/** Search field page body: a search box that filters in place, and when to use which. */
export async function SearchFieldBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Filtering a list',
      file: 'search-field/search-field-filter',
      name: 'SearchFieldFilter',
    },
    {
      title: 'With a trailing icon',
      file: 'search-field/search-field-trailing',
      name: 'SearchFieldTrailing',
    },
    { title: 'Disabled', file: 'search-field/search-field-disabled', name: 'SearchFieldDisabled' },
    {
      title: 'Full width in a pane',
      file: 'search-field/search-field-pane',
      name: 'SearchFieldPane',
    },
  ]);

  return {
    overview,
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            A <InlineCode>SearchField</InlineCode> filters what&apos;s already on the screen (a
            settings page, a table, a list pane) as the person types. It&apos;s the search
            bar&apos;s 56px pill, filling its container, and it never opens a search view. Escape
            clears the query, Enter calls <InlineCode>onSubmit</InlineCode>, and a clear button
            shows while there&apos;s text; it clears and keeps focus in the input. It is controlled
            with <InlineCode>value</InlineCode> / <InlineCode>onChange</InlineCode>.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 id="when-to-use-which" className="text-headline-small text-on-surface">
            When to use which
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>SearchField</InlineCode> filters content in place. Screen readers hear a
              search box.
            </li>
            <li>
              <InlineCode>SearchBar</InlineCode> opens a view of suggestions or results, docked or
              full screen. Screen readers hear a combobox that opens a dialog.
            </li>
            <li>
              <InlineCode>TextField</InlineCode> with{' '}
              <InlineCode>type=&quot;search&quot;</InlineCode> is a search inside a form, with a
              label, supporting text and errors.
            </li>
          </ul>
        </section>
        <section className="flex flex-col gap-3">
          <h2 id="filtering" className="text-headline-small text-on-surface">
            Filtering
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Point <InlineCode>aria-controls</InlineCode> at what the field filters, and say when
            nothing matches in a <InlineCode>role=&quot;status&quot;</InlineCode> region, so screen
            readers hear it. <InlineCode>matchesSearch</InlineCode> matches anywhere, ignoring case
            and accents, as a searchable <InlineCode>Select</InlineCode> does.
          </p>
        </section>
      </>
    ),
    api: (
      <section className="flex flex-col gap-3">
        <h2 id="tokens-and-shape" className="text-headline-small text-on-surface">
          Tokens and shape
        </h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            It reads the search bar&apos;s tokens (<InlineCode>md-comp-search-bar</InlineCode>,{' '}
            <a className="text-primary underline" href="/components/search/api#tokens">
              listed on the Search page
            </a>
            ), so a theme or a scoped override restyles the search field and the search bar
            together.
          </li>
          <li>
            It&apos;s 56px tall, as M3&apos;s search bar, and fills its container; a consumer{' '}
            <InlineCode>w-*</InlineCode> or <InlineCode>h-*</InlineCode> class wins. It has no{' '}
            <InlineCode>density</InlineCode>.
          </li>
          <li>
            The trailing slot holds the clear button and <InlineCode>trailingIcon</InlineCode>: one
            icon button, or an avatar (an <InlineCode>img</InlineCode>, drawn at 30px).
          </li>
        </ul>
      </section>
    ),
  };
}
