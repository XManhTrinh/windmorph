import { ExampleViewer } from '../../components/example-viewer';
import { ExpandableTextCollapsible } from '../../examples/expandable-text/expandable-text-collapsible';
import { ExpandableTextPost } from '../../examples/expandable-text/expandable-text-post';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** Expandable text page body: purpose, examples, behaviour, accessibility and tokens. */
export async function ExpandableTextBody() {
  const [post, collapsible] = await Promise.all([
    readExampleSource('expandable-text/expandable-text-post.tsx'),
    readExampleSource('expandable-text/expandable-text-collapsible.tsx'),
  ]);
  const [postHtml, collapsibleHtml] = await Promise.all([
    highlightSource(post),
    highlightSource(collapsible),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Long text cut to a few lines, with &quot;See more&quot; at the end of the last line that
          expands it in place: posts, comments, reviews, listing descriptions and bios. Clamping is
          one line of CSS, but showing the button only when the text is actually cut needs
          measuring, again whenever the width changes, and expanding has to keep focus where the
          reader is. It is <strong className="text-on-surface">not an M3 component</strong>, so it
          comes from {code('@windmorph/react-pro')}.
        </p>
        <p className="text-body-large text-on-surface-variant">
          To hide whole sections behind a heading, use a list or a disclosure instead; to open the
          full text somewhere else, use a {code('Link')} to its page.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Feed posts"
          code={post}
          html={postHtml}
          fileName="expandable-text-post.tsx"
        >
          <ExpandableTextPost />
        </ExampleViewer>
        <ExampleViewer
          title="See less, in French"
          code={collapsible}
          html={collapsibleHtml}
          fileName="expandable-text-collapsible.tsx"
        >
          <ExpandableTextCollapsible />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Behaviour</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            {code('lines')} sets how many lines show (5 by default). Line breaks in the text are
            kept, and it can hold inline content such as links and mentions.
          </li>
          <li>
            &quot;See more&quot; shows only when the text is cut, measured again when the width
            changes, the text changes or web fonts arrive. The end of the last line fades out under
            it, so it works on any container colour.
          </li>
          <li>
            Expanding is instant, with no height animation, so the text never moves under the
            reader. There is no &quot;See less&quot; by default; {code('collapsible')} adds one.
          </li>
          <li>
            {code('expanded')} and {code('onExpandedChange')} control it, for example to keep a post
            open when a virtualised feed mounts it again; {code('defaultExpanded')} starts it open.
          </li>
          <li>
            Server-rendered pages show the text clamped from the first paint, with no layout shift.
            Without JavaScript the full text shows.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            &quot;See more&quot; is a button with {code('aria-expanded')} and{' '}
            {code('aria-controls')}, a 48px touch target and the M3 focus ring.
          </li>
          <li>
            Pressing it moves focus to the start of the text, so the reader carries on from there;
            &quot;See less&quot; returns focus to &quot;See more&quot;.
          </li>
          <li>
            Screen readers read the whole text even while it&apos;s cut, so nothing is hidden from
            them.
          </li>
          <li>
            The words come from {code('labels')} ({code('more')}, {code('less')}), so they can be
            translated. Set {code('lang')} when the text is in another language than the page.
          </li>
          <li>In forced-colours mode the buttons use the system button colour, underlined.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming &amp; tokens</h2>
        <p className="text-body-large text-on-surface-variant">
          The text and the buttons take the surrounding type and colour: set them with{' '}
          {code('className')} (a type role and a colour role, such as{' '}
          {code('text-body-large text-on-surface')}). The buttons use the label roles&apos; weight
          and underline on hover, focus and press. Style the parts with {code('classNames')} (
          {code('root')}, {code('content')}, {code('button')}).
        </p>
      </section>
    </>
  );
}
