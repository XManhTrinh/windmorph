import { ExampleViewer } from '../../components/example-viewer';
import { ChipsAssistSuggestion } from '../../examples/chips/chips-assist-suggestion';
import { ChipsFilter } from '../../examples/chips/chips-filter';
import { ChipsInput } from '../../examples/chips/chips-input';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Chips page body: assist, suggestion, filter and input chips. */
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
          There is no chip group component — lay chips out with flex. Flat chips carry a 1px
          outline; <code className="text-on-surface">elevated</code> swaps it for a tonal surface at
          level 1.
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
          title="Filter (toggle)"
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
            Assist and suggestion chips are buttons (assist may be a link with{' '}
            <code className="text-on-surface">href</code>); Tab focuses them and Enter or Space
            activates them. Leading / trailing icons are decorative.
          </li>
          <li>
            A filter chip is a toggle: it exposes{' '}
            <code className="text-on-surface">aria-pressed</code> and flips with Space / Enter.
          </li>
          <li>
            An input chip is a container with two separate buttons — the primary action and the
            remove button — because interactive content can&apos;t nest. The remove button is named
            &quot;{'{removeLabel}'} + label&quot; (e.g. &quot;Remove Alice&quot;).
          </li>
          <li>
            With <code className="text-on-surface">onRemove</code> set, pressing Backspace or Delete
            on the chip also removes it.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Values from Compose&apos;s <code className="text-on-surface">Chip.kt</code> and the
            token files: 32px tall (48px touch target),{' '}
            <code className="text-on-surface">label-large</code>, 18px icons, 24px round avatars.
          </li>
          <li>
            Assist and suggestion chips keep 8px corners. Filter and input chips use Compose&apos;s
            Expressive <code className="text-on-surface">shapes</code> overload — 12px, 8px while
            pressed, round when selected, on the fast spatial spring; the classic 8px filter / input
            chips are not offered.
          </li>
          <li>
            Selected filter and input chips are{' '}
            <code className="text-on-surface">secondary-container</code> with no border; a selected
            input chip&apos;s leading icon is <code className="text-on-surface">primary</code>.
          </li>
          <li>
            Without a leading icon, a selected filter chip grows a check (grid{' '}
            <code className="text-on-surface">0fr → 1fr</code>) and shifts its start padding 16 →
            8px, as in Compose&apos;s samples.
          </li>
          <li>
            The input chip is a container holding two buttons; the container shows the state layer
            of whichever button is used, and each button has its own focus ring.
          </li>
        </ul>
      </section>
    </>
  );
}
