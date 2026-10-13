import { ExampleViewer } from '../../components/example-viewer';
import { ChipsAssistSuggestion } from '../../examples/chips/chips-assist-suggestion';
import { ChipsFilter } from '../../examples/chips/chips-filter';
import { ChipsInput } from '../../examples/chips/chips-input';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Chips page body: assist, suggestion, filter and input chips, and the chip set. */
export async function ChipsBody() {
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

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Chips are compact elements for a secondary action or a small piece of information. There
          are four types: <code className="text-on-surface">AssistChip</code> for a smart action,{' '}
          <code className="text-on-surface">SuggestionChip</code> for a generated option,{' '}
          <code className="text-on-surface">FilterChip</code> for a toggleable filter, and{' '}
          <code className="text-on-surface">InputChip</code> for an entry the user added.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Chips appear in a set: <code className="text-on-surface">ChipSet</code> lays them out 8px
          apart, wrapping or in one row that scrolls, makes the set one Tab stop with arrow keys
          between chips, and can share a single or multiple selection between filter chips. Flat
          chips carry a 1px outline (
          <code className="text-on-surface">outline=&quot;strong&quot;</code> for 3:1 contrast);{' '}
          <code className="text-on-surface">elevated</code> swaps it for a tonal surface at level 1,
          for chips over images.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A <code className="text-on-surface">ChipSet</code> is a labelled group (a radio group
            with single selection). Tab moves into and out of the set; the arrow keys move between
            its chips and Home / End go to the first and last.
          </li>
          <li>
            Assist and suggestion chips are buttons (assist may be a link with{' '}
            <code className="text-on-surface">href</code>); Enter or Space activates them. Icons are
            decorative.
          </li>
          <li>
            A filter chip is a toggle: it exposes{' '}
            <code className="text-on-surface">aria-pressed</code> (or{' '}
            <code className="text-on-surface">aria-checked</code> in a single-select set) and flips
            with Space / Enter.
          </li>
          <li>
            An input chip with only <code className="text-on-surface">onRemove</code> is one focus
            stop, its remove button, named &quot;{'{removeLabel}'} + label&quot; (&quot;Remove
            Alex&quot;); the focus ring circles the whole chip. With{' '}
            <code className="text-on-surface">onPress</code> too, the chip and its remove button are
            two focus stops. A filter chip with <code className="text-on-surface">onRemove</code>{' '}
            works the same way.
          </li>
          <li>Backspace or Delete on a removable chip removes it.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Spec values</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            32px tall with a 48px touch target, 8px corners for every chip type,{' '}
            <code className="text-on-surface">label-large</code>, 18px icons, 24px avatars with 12px
            corners.
          </li>
          <li>
            16px at an edge without an icon, 8px beside one (4px beside an avatar), 8px between
            elements and between chips.
          </li>
          <li>
            Leading icons are <code className="text-on-surface">primary</code>. Selected filter and
            input chips are <code className="text-on-surface">secondary-container</code> with no
            border.
          </li>
          <li>
            The remove button has a 48px target, and a chip with one is at least 88px wide so the
            target never covers the label.
          </li>
          <li>
            Without a leading icon, a selected filter chip grows a check and its start padding moves
            16 → 8px.
          </li>
          <li>Assist chips have no trailing icon; filter and input chips may.</li>
        </ul>
      </section>
    </>
  );
}
