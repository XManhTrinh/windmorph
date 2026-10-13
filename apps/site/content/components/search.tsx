import { ExampleViewer } from '../../components/example-viewer';
import { SearchAppBarDemo } from '../../examples/search/search-app-bar';
import { SearchDocked } from '../../examples/search/search-docked';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Search page body: a docked search bar and the app bar with search. */
export async function SearchBody() {
  const [docked, appBar] = await Promise.all([
    readExampleSource('search/search-docked.tsx'),
    readExampleSource('search/search-app-bar.tsx'),
  ]);
  const [dockedHtml, appBarHtml] = await Promise.all([
    highlightSource(docked),
    highlightSource(appBar),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A <InlineCode>SearchBar</InlineCode> is a 56px pill that expands into a search view
          holding suggestions or results. With <InlineCode>view=&quot;docked&quot;</InlineCode> (the
          default) it opens a dropdown below the bar over a scrim; with{' '}
          <InlineCode>view=&quot;full-screen&quot;</InlineCode> it grows to fill the window, for
          compact windows. It is controlled with <InlineCode>value</InlineCode> /{' '}
          <InlineCode>onChange</InlineCode>, and <InlineCode>onSubmit</InlineCode> fires on Enter.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>leadingIcon</InlineCode> and <InlineCode>trailingIcon</InlineCode> can be
          functions of <InlineCode>{'{ expanded, collapse }'}</InlineCode>, so a back or clear
          button appears while the view is open. The trailing slot holds one or two icon buttons, or
          an avatar (an <InlineCode>img</InlineCode>, drawn at 30px) and one icon button.{' '}
          <InlineCode>textAlign=&quot;center&quot;</InlineCode> centres the collapsed text.{' '}
          <InlineCode>SearchAppBar</InlineCode> (Compose&apos;s{' '}
          <InlineCode>AppBarWithSearch</InlineCode>) wraps a search bar in a top bar with a{' '}
          <InlineCode>navigationIcon</InlineCode>, <InlineCode>actions</InlineCode> and{' '}
          <InlineCode>scrollBehavior</InlineCode>.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Docked search"
          code={docked}
          html={dockedHtml}
          fileName="search-docked.tsx"
        >
          <SearchDocked />
        </ExampleViewer>
        <ExampleViewer
          title="App bar with search"
          code={appBar}
          html={appBarHtml}
          fileName="search-app-bar.tsx"
        >
          <SearchAppBarDemo />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Name the bar with <InlineCode>aria-label</InlineCode> or{' '}
            <InlineCode>aria-labelledby</InlineCode> (required by the types); the bar inside a{' '}
            <InlineCode>SearchAppBar</InlineCode> still needs its own name.
          </li>
          <li>
            The collapsed input is a <InlineCode>combobox</InlineCode> with{' '}
            <InlineCode>aria-haspopup=&quot;dialog&quot;</InlineCode> and{' '}
            <InlineCode>aria-expanded</InlineCode>. A press, typing, or ↓ expands it; Tab focus
            alone does not.
          </li>
          <li>
            The expanded view is a modal dialog named like the bar. It has its own input (the
            collapsed one becomes <InlineCode>inert</InlineCode> and{' '}
            <InlineCode>aria-hidden</InlineCode>), and focus returns on close.
          </li>
          <li>
            In the view, ↓ from the input moves focus to the first focusable item of the content;
            Escape or an outside press collapses it. Enter submits and moves focus to the results,
            leaving the query visible.
          </li>
          <li>
            Pass <InlineCode>resultsAnnouncement</InlineCode> (e.g. &quot;5 results&quot;): a polite
            live region in the view reads it when the view opens and whenever it changes, as M3
            requires.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The docked field widens by 12px on each side when it opens (M3 Expressive&apos;s 24 →
            12dp margins), and its dropdown slides down from half its height on the default spatial
            spring over a 32% scrim; with the field it is 240px to 2/3 of the window tall.
          </li>
          <li>
            The full-screen view uses M3 Expressive&apos;s contained style: a{' '}
            <InlineCode>surface-container-low</InlineCode> surface that grows from the bar&apos;s
            bounds via a <InlineCode>clip-path</InlineCode> on the slow spatial spring, with the
            filled field 16px from each side.
          </li>
          <li>
            In a <InlineCode>SearchAppBar</InlineCode> the field is{' '}
            <InlineCode>surface-container</InlineCode> and fills the free space up to 312px, then
            half of it (M3).
          </li>
          <li>
            The field is 360px wide by default and at most 720px (Compose&apos;s{' '}
            <InlineCode>sizeIn</InlineCode>); a consumer <InlineCode>w-*</InlineCode> class wins.
          </li>
          <li>
            Not in v1: predictive back, the divided (baseline) style, and the docked view without a
            gap.
          </li>
        </ul>
      </section>
    </>
  );
}
