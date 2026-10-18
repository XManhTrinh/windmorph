import {
  assistChipTokenSet,
  filterChipTokenSet,
  inputChipTokenSet,
  suggestionChipTokenSet,
} from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const ChipsAssistSuggestion = lazyExample('chips/chips-assist-suggestion', 'ChipsAssistSuggestion');
const ChipsFilter = lazyExample('chips/chips-filter', 'ChipsFilter');
const ChipsInput = lazyExample('chips/chips-input', 'ChipsInput');
const ChipsDensityExample = lazyExample('chips/chips-density', 'ChipsDensity');

/** Chips page body: assist, suggestion, filter and input chips, and the chip set. */
export async function ChipsBody(): Promise<ComponentDoc> {
  const [assist, filter, input] = await Promise.all([
    readExampleSource('chips/chips-assist-suggestion.tsx'),
    readExampleSource('chips/chips-filter.tsx'),
    readExampleSource('chips/chips-input.tsx'),
  ]);
  const [assistHtml, filterHtml, inputHtml] = await Promise.all([
    highlightSource(assist),
    highlightSource(filter),
    highlightSource(input),
  ]);

  const densitySource = await readExampleSource('chips/chips-density.tsx');
  const densityHtml = await highlightSource(densitySource);
  return {
    tokens: [assistChipTokenSet, suggestionChipTokenSet, filterChipTokenSet, inputChipTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Assist and suggestion"
            code={assist}
            html={assistHtml}
            fileName="chips-assist-suggestion.tsx"
          >
            <ChipsAssistSuggestion />
          </ExampleViewer>
          <ExampleViewer
            title="Filter chips in a chip set"
            code={filter}
            html={filterHtml}
            fileName="chips-filter.tsx"
          >
            <ChipsFilter />
          </ExampleViewer>
          <ExampleViewer
            title="Input (removable)"
            code={input}
            html={inputHtml}
            fileName="chips-input.tsx"
          >
            <ChipsInput />
          </ExampleViewer>
          <ExampleViewer
            title="Density"
            code={densitySource}
            html={densityHtml}
            fileName="chips-density.tsx"
          >
            <ChipsDensityExample />
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
            Chips are compact elements for a secondary action or a small piece of information. There
            are four types: <InlineCode>AssistChip</InlineCode> for a smart action,{' '}
            <InlineCode>SuggestionChip</InlineCode> for a generated option,{' '}
            <InlineCode>FilterChip</InlineCode> for a toggleable filter, and{' '}
            <InlineCode>InputChip</InlineCode> for an entry the user added.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Chips appear in a set: <InlineCode>ChipSet</InlineCode> lays them out 8px apart,
            wrapping or in one row that scrolls, makes the set one Tab stop with arrow keys between
            chips, and can share a single or multiple selection between filter chips. Flat chips
            carry a 1px outline (<InlineCode>outline=&quot;strong&quot;</InlineCode> for 3:1
            contrast); <InlineCode>elevated</InlineCode> swaps it for a tonal surface at level 1,
            for chips over images.
          </p>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="spec-values" className="text-headline-small text-on-surface">
            Spec values
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              32px tall (a minimum: a chip grows with a large browser font size) with a 48px touch
              target, 8px corners for every chip type, <InlineCode>label-large</InlineCode>, 18px
              icons, 24px avatars with 12px corners.
            </li>
            <li>
              16px at an edge without an icon, 8px beside one (4px beside an avatar), 8px between
              elements and between chips. Padding counts from the chip&apos;s edge: a flat
              chip&apos;s 1px border takes none of it, so flat and elevated chips are the same size.
            </li>
            <li>
              Elevation never shows a press: an elevated chip rises from level 1 to 2 on hover and a
              selected flat filter chip from 0 to 1, only while it isn&apos;t pressed or
              keyboard-focused. A keyboard-focused flat chip&apos;s border darkens to{' '}
              <InlineCode>on-surface</InlineCode> (assist, suggestion) or{' '}
              <InlineCode>on-surface-variant</InlineCode> (filter, input).
            </li>
            <li>
              Leading icons are <InlineCode>primary</InlineCode>. Selected filter and input chips
              are <InlineCode>secondary-container</InlineCode> with no border.
            </li>
            <li>
              The remove button has a 48px target, and a chip with one is at least 88px wide so the
              target never covers the label.
            </li>
            <li>
              A selected <InlineCode>InputChip</InlineCode> without <InlineCode>onPress</InlineCode>{' '}
              has no <InlineCode>aria-pressed</InlineCode> to carry its state, so it says it in
              words (<InlineCode>labels.selected</InlineCode>, &ldquo;Selected&rdquo;): the remove
              button&apos;s description, or hidden text on a static chip.
            </li>
            <li>
              Without a leading icon, a selected filter chip grows a check and its start padding
              moves 16 → 8px.
            </li>
            <li>
              Only filter chips take a trailing icon (<InlineCode>trailingIcon</InlineCode>); input
              chips end with their remove button, and assist and suggestion chips have none.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
