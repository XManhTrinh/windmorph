import { searchBarTokenSet, searchViewTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const SearchAppBarDemo = lazyExample('search/search-app-bar', 'SearchAppBarDemo');
const SearchDocked = lazyExample('search/search-docked', 'SearchDocked');
const SearchFullScreen = lazyExample('search/search-full-screen', 'SearchFullScreen');

/** Search page body: docked and full-screen search, and the app bar with search. */
export async function SearchBody(): Promise<ComponentDoc> {
  const [docked, fullScreen, appBar] = await Promise.all([
    readExampleSource('search/search-docked.tsx'),
    readExampleSource('search/search-full-screen.tsx'),
    readExampleSource('search/search-app-bar.tsx'),
  ]);
  const [dockedHtml, fullScreenHtml, appBarHtml] = await Promise.all([
    highlightSource(docked),
    highlightSource(fullScreen),
    highlightSource(appBar),
  ]);

  return {
    tokens: [searchBarTokenSet, searchViewTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Docked search"
            code={docked}
            html={dockedHtml}
            fileName="search-docked.tsx"
          >
            <SearchDocked />
          </ExampleViewer>
          <ExampleViewer
            title="Full-screen search"
            code={fullScreen}
            html={fullScreenHtml}
            fileName="search-full-screen.tsx"
          >
            <SearchFullScreen />
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
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            A <InlineCode>SearchBar</InlineCode> is a 56px pill that expands into a search view
            holding suggestions or results. With <InlineCode>view=&quot;docked&quot;</InlineCode> it
            opens a dropdown below the bar over a scrim; with{' '}
            <InlineCode>view=&quot;full-screen&quot;</InlineCode> it grows to fill the window. The
            default, <InlineCode>view=&quot;auto&quot;</InlineCode>, is full screen on compact
            windows (below 600px wide) and docked on larger ones, as M3 recommends. It is controlled
            with <InlineCode>value</InlineCode> / <InlineCode>onChange</InlineCode>, and{' '}
            <InlineCode>onSubmit</InlineCode> fires on Enter.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>leadingIcon</InlineCode> and <InlineCode>trailingIcon</InlineCode> can be
            functions of <InlineCode>{'{ expanded, collapse, view }'}</InlineCode>, so a back or
            clear button appears while the view is open. The trailing slot holds one or two icon
            buttons, or an avatar (an <InlineCode>img</InlineCode>, drawn at 30px) and one icon
            button. <InlineCode>textAlign=&quot;center&quot;</InlineCode> centres the collapsed
            text. <InlineCode>SearchAppBar</InlineCode> (Compose&apos;s{' '}
            <InlineCode>AppBarWithSearch</InlineCode>) wraps a search bar in a top bar with a{' '}
            <InlineCode>navigationIcon</InlineCode>, <InlineCode>actions</InlineCode> and{' '}
            <InlineCode>scrollBehavior</InlineCode>.
          </p>
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
              The docked field widens by 12px on each side when it opens (M3 Expressive&apos;s 24 →
              12dp margins), and its dropdown slides down from half its height on the default
              spatial spring over a 32% scrim; with the field it is 240px to 2/3 of the window tall.
            </li>
            <li>
              The docked dropdown&apos;s height follows the results on the default spatial spring as
              they change; Compose lays it out again at once.
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
              Not yet supported: predictive back, the divided (baseline) style, and the docked view
              without a gap.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
