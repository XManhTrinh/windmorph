import { ExampleViewer } from '../../components/example-viewer';
import { SearchAppBarDemo } from '../../examples/search/search-app-bar';
import { SearchDocked } from '../../examples/search/search-docked';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

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
          A <code className="text-on-surface">SearchBar</code> is a 56px pill that expands into a
          search view holding suggestions or results. With{' '}
          <code className="text-on-surface">view=&quot;docked&quot;</code> (the default) it opens a
          dropdown below the bar over a scrim; with{' '}
          <code className="text-on-surface">view=&quot;full-screen&quot;</code> it grows to fill the
          window, for compact windows. It is controlled with{' '}
          <code className="text-on-surface">value</code> /{' '}
          <code className="text-on-surface">onChange</code>, and{' '}
          <code className="text-on-surface">onSubmit</code> fires on Enter.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">leadingIcon</code> and{' '}
          <code className="text-on-surface">trailingIcon</code> can be functions of{' '}
          <code className="text-on-surface">{'{ expanded, collapse }'}</code>, so a back or clear
          button appears while the view is open.{' '}
          <code className="text-on-surface">SearchAppBar</code> (Compose&apos;s{' '}
          <code className="text-on-surface">AppBarWithSearch</code>) wraps a search bar in a top bar
          with a <code className="text-on-surface">navigationIcon</code>,{' '}
          <code className="text-on-surface">actions</code> and{' '}
          <code className="text-on-surface">scrollBehavior</code>.
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
            Name the bar with <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code> (required by the types); the
            bar inside a <code className="text-on-surface">SearchAppBar</code> still needs its own
            name.
          </li>
          <li>
            The collapsed input is a <code className="text-on-surface">combobox</code> with{' '}
            <code className="text-on-surface">aria-haspopup=&quot;dialog&quot;</code> and{' '}
            <code className="text-on-surface">aria-expanded</code>. A press, typing, or ↓ expands
            it; Tab focus alone does not.
          </li>
          <li>
            The expanded view is a modal dialog named like the bar. It has its own input (the
            collapsed one becomes <code className="text-on-surface">inert</code> and{' '}
            <code className="text-on-surface">aria-hidden</code>), and focus returns on close.
          </li>
          <li>
            In the view, ↓ from the input moves focus to the first focusable item of the content;
            Escape or an outside press collapses it.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The docked dropdown slides down from half its height on the default spatial spring over
            a 32% scrim; the full-screen view grows from the bar&apos;s bounds via a{' '}
            <code className="text-on-surface">clip-path</code> on the slow spatial spring, so
            nothing is transformed.
          </li>
          <li>
            The field is 360px wide by default and at most 720px (Compose&apos;s{' '}
            <code className="text-on-surface">sizeIn</code>); a consumer{' '}
            <code className="text-on-surface">w-*</code> class wins.
          </li>
          <li>
            Not in v1: predictive back, the contained full-screen variant, and the docked view
            without a gap.
          </li>
        </ul>
      </section>
    </>
  );
}
