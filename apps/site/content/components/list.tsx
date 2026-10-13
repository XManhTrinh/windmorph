import { ExampleViewer } from '../../components/example-viewer';
import { ListDividers } from '../../examples/list/list-dividers';
import { ListInteractive } from '../../examples/list/list-interactive';
import { ListLinks } from '../../examples/list/list-links';
import { ListMedia } from '../../examples/list/list-media';
import { ListRadio } from '../../examples/list/list-radio';
import { ListStatic } from '../../examples/list/list-static';
import { ListToggles } from '../../examples/list/list-toggles';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/**
 * List page body: static, media, dividers and line limits, link, interactive, switch and
 * checkbox, and radio lists.
 */
export async function ListBody() {
  const [staticSrc, media, dividers, links, interactive, toggles, radio] = await Promise.all([
    readExampleSource('list/list-static.tsx'),
    readExampleSource('list/list-media.tsx'),
    readExampleSource('list/list-dividers.tsx'),
    readExampleSource('list/list-links.tsx'),
    readExampleSource('list/list-interactive.tsx'),
    readExampleSource('list/list-toggles.tsx'),
    readExampleSource('list/list-radio.tsx'),
  ]);
  const [staticHtml, mediaHtml, dividersHtml, linksHtml, interactiveHtml, togglesHtml, radioHtml] =
    await Promise.all([
      highlightSource(staticSrc),
      highlightSource(media),
      highlightSource(dividers),
      highlightSource(links),
      highlightSource(interactive),
      highlightSource(toggles),
      highlightSource(radio),
    ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A list presents a vertical set of items, each with a headline and optional overline,
          supporting text and leading or trailing content. Use it for rows that stay visible; for a
          temporary set of choices anchored to a button use a{' '}
          <code className="text-on-surface">Menu</code>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">List</code> holds{' '}
          <code className="text-on-surface">ListItem</code> children identified by a React{' '}
          <code className="text-on-surface">key</code>. The{' '}
          <code className="text-on-surface">variant</code> is{' '}
          <code className="text-on-surface">standard</code> (flush) or{' '}
          <code className="text-on-surface">segmented</code> (rounded groups 2px apart).
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Static list"
          code={staticSrc}
          html={staticHtml}
          fileName="list-static.tsx"
        >
          <ListStatic />
        </ExampleViewer>
        <ExampleViewer
          title="Images and video"
          code={media}
          html={mediaHtml}
          fileName="list-media.tsx"
        >
          <ListMedia />
        </ExampleViewer>
        <ExampleViewer
          title="Dividers and line limits"
          code={dividers}
          html={dividersHtml}
          fileName="list-dividers.tsx"
        >
          <ListDividers />
        </ExampleViewer>
        <ExampleViewer title="Links" code={links} html={linksHtml} fileName="list-links.tsx">
          <ListLinks />
        </ExampleViewer>
        <ExampleViewer
          title="Interactive list"
          code={interactive}
          html={interactiveHtml}
          fileName="list-interactive.tsx"
        >
          <ListInteractive />
        </ExampleViewer>
        <ExampleViewer
          title="Switch and checkbox items"
          code={toggles}
          html={togglesHtml}
          fileName="list-toggles.tsx"
        >
          <ListToggles />
        </ExampleViewer>
        <ExampleViewer title="Radio list" code={radio} html={radioHtml} fileName="list-radio.tsx">
          <ListRadio />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Images, video, lines and dividers</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">ListItemImage</code> in{' '}
            <code className="text-on-surface">leading</code> is M3&apos;s 56dp image, cropped to
            fill. Pass <code className="text-on-surface">src</code>,{' '}
            <code className="text-on-surface">srcSet</code> and{' '}
            <code className="text-on-surface">sizes</code>, or your framework&apos;s image as its
            child. <code className="text-on-surface">fallback</code> (an icon) shows with no image
            or when it fails to load.
          </li>
          <li>
            <code className="text-on-surface">ListItemVideo</code> is a video&apos;s thumbnail,
            100dp wide and 56dp tall (
            <code className="text-on-surface">size=&quot;large&quot;</code>: 69dp), with a play
            badge and its <code className="text-on-surface">duration</code>. Pressing it is pressing
            the item.
          </li>
          <li>
            Media are square, as M3 specifies. Round them with the list&apos;s{' '}
            <code className="text-on-surface">classNames.media</code> or their own{' '}
            <code className="text-on-surface">className</code>.
          </li>
          <li>
            <code className="text-on-surface">headlineLines</code> and{' '}
            <code className="text-on-surface">supportingTextLines</code> (1 to 3), on the list or an
            item, end long text with &quot;…&quot;; the full text stays in the accessible name.
            M3&apos;s limits are one line of supporting text in a two-line item and two in a
            three-line item. There are no limits by default.
          </li>
          <li>
            <code className="text-on-surface">dividers=&quot;full&quot;</code> or{' '}
            <code className="text-on-surface">&quot;inset&quot;</code> (16dp from each side) draws
            M3&apos;s dividers between items of a standard list. Segmented items are already apart,
            so they don&apos;t take dividers.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Which list</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Items that go to other pages (a settings menu, legal pages): link items (
            <code className="text-on-surface">href</code>, with{' '}
            <code className="text-on-surface">current</code> on the page being shown), in a list
            without <code className="text-on-surface">onAction</code>.
          </li>
          <li>
            An on/off setting that applies at once: a switch item (
            <code className="text-on-surface">control=&quot;switch&quot;</code>). Choosing several
            items: checkbox items (
            <code className="text-on-surface">control=&quot;checkbox&quot;</code>
            ).
          </li>
          <li>
            One choice out of a few, applied at once: a radio list (
            <code className="text-on-surface">value</code> /{' '}
            <code className="text-on-surface">onValueChange</code>, each item with a{' '}
            <code className="text-on-surface">value</code>).
          </li>
          <li>
            An item that opens something and also has its own switch: an interactive list with a{' '}
            <code className="text-on-surface">Switch</code> in the item&apos;s trailing content.
          </li>
          <li>
            Many options, or choices inside a form with a submit button:{' '}
            <code className="text-on-surface">RadioGroup</code>,{' '}
            <code className="text-on-surface">Checkbox</code> or{' '}
            <code className="text-on-surface">Switch</code> on their own.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Link items in a list without <code className="text-on-surface">onAction</code> or{' '}
            <code className="text-on-surface">selectionMode</code> are real links (
            <code className="text-on-surface">&lt;a href&gt;</code>): each is a Tab stop, Enter
            follows it, and the browser&apos;s link menu, status bar and new-tab clicks work. A
            plain click goes through the app&apos;s router (
            <code className="text-on-surface">NextRouterProvider</code>
            ). The link is the headline, with an overlay over the whole item, so buttons in the
            trailing content stay their own controls.{' '}
            <code className="text-on-surface">current</code> sets{' '}
            <code className="text-on-surface">aria-current=&quot;page&quot;</code>.
          </li>
          <li>
            With <code className="text-on-surface">onAction</code> or{' '}
            <code className="text-on-surface">selectionMode</code> the list is a grid list: ↑ / ↓
            move between items, ← / → reach a trailing control (such as a switch), and typeahead
            jumps by headline.
          </li>
          <li>
            Press or Enter fires <code className="text-on-surface">onAction</code> with the
            item&apos;s key; in a selectable list it toggles selection (
            <code className="text-on-surface">selectedKeys</code> /{' '}
            <code className="text-on-surface">onSelectionChange</code>,{' '}
            <code className="text-on-surface">disabledKeys</code>).
          </li>
          <li>
            Without those props the list is a plain <code className="text-on-surface">ul</code>;
            only its link, switch and checkbox items take focus.
          </li>
          <li>
            A switch or checkbox item is one control: a native checkbox (with{' '}
            <code className="text-on-surface">role=&quot;switch&quot;</code> for switches) named by
            the headline and described by the overline and supporting text. Tab reaches each item;
            Space toggles it. They post with a form through{' '}
            <code className="text-on-surface">name</code> and{' '}
            <code className="text-on-surface">value</code>.
          </li>
          <li>
            A radio list is a <code className="text-on-surface">radiogroup</code> of native radio
            buttons: one Tab stop, and ↑ / ↓ move the choice.
          </li>
          <li>
            A name is required (<code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code>); give a non-string headline a{' '}
            <code className="text-on-surface">textValue</code> for typeahead and announcements.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Heights follow Compose: at least 56px (one line), 72px (overline or supporting text) and
            88px (both); three-line items align to the top, others to the centre.
          </li>
          <li>
            Every <code className="text-on-surface">ListItem</code> and{' '}
            <code className="text-on-surface">SegmentedListItem</code> overload is covered: static
            items, clickable items (<code className="text-on-surface">onAction</code>, links),
            single selection (radio lists) and checkable items (switch and checkbox items). Checked
            and selected items take the selected colours and shape, as in Compose.
          </li>
          <li>
            Deviation: switch items have the switch role, so screen readers say on and off; Compose
            gives every checkable item the checkbox role, because Android lists have no switch role.
          </li>
          <li>
            Not included: long press (<code className="text-on-surface">onLongClick</code>). On the
            web, an action needs a way in for every pointer and keyboard, so put it in a menu from a
            trailing icon button.
          </li>
          <li>
            Shape precedence (pressed, then selected or focused at 16px, then hovered at 12px, else
            4px) is computed into one <code className="text-on-surface">data-shape</code> that
            morphs on the fast spatial spring; segmented groups round their outer corners.
          </li>
          <li>
            Deviation: standard items are transparent rather than Compose&apos;s{' '}
            <code className="text-on-surface">surface</code>, so a list takes the colour of its
            sheet, card or pane. Not in v1: drag-to-reorder, swipe-to-reveal and expandable items.
          </li>
        </ul>
      </section>
    </>
  );
}
