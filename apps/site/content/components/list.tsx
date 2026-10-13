import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { ListDividers } from '../../examples/list/list-dividers';
import { ListExpandable } from '../../examples/list/list-expandable';
import { ListInteractive } from '../../examples/list/list-interactive';
import { ListLinks } from '../../examples/list/list-links';
import { ListMedia } from '../../examples/list/list-media';
import { ListRadio } from '../../examples/list/list-radio';
import { ListStatic } from '../../examples/list/list-static';
import { ListToggles } from '../../examples/list/list-toggles';
import { ListSelection } from '../../examples/list/list-selection';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/**
 * List page body: static, media, dividers and line limits, link, interactive, switch and
 * checkbox, radio and expandable lists.
 */
export async function ListBody(): Promise<ComponentDoc> {
  const [staticSrc, media, dividers, links, interactive, toggles, radio, expandable] =
    await Promise.all([
      readExampleSource('list/list-static.tsx'),
      readExampleSource('list/list-media.tsx'),
      readExampleSource('list/list-dividers.tsx'),
      readExampleSource('list/list-links.tsx'),
      readExampleSource('list/list-interactive.tsx'),
      readExampleSource('list/list-toggles.tsx'),
      readExampleSource('list/list-radio.tsx'),
      readExampleSource('list/list-expandable.tsx'),
    ]);
  const [
    staticHtml,
    mediaHtml,
    dividersHtml,
    linksHtml,
    interactiveHtml,
    togglesHtml,
    radioHtml,
    expandableHtml,
  ] = await Promise.all([
    highlightSource(staticSrc),
    highlightSource(media),
    highlightSource(dividers),
    highlightSource(links),
    highlightSource(interactive),
    highlightSource(toggles),
    highlightSource(radio),
    highlightSource(expandable),
  ]);

  const selection = await readExampleSource('list/list-selection.tsx');
  const selectionHtml = await highlightSource(selection);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
            title="Single and multiple selection"
            code={selection}
            html={selectionHtml}
            fileName="list-selection.tsx"
          >
            <ListSelection />
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
          <ExampleViewer
            title="Expandable items"
            code={expandable}
            html={expandableHtml}
            fileName="list-expandable.tsx"
          >
            <ListExpandable />
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
            A list presents a vertical set of items, each with a headline and optional overline,
            supporting text and leading or trailing content. Use it for rows that stay visible; for
            a temporary set of choices anchored to a button use a <InlineCode>Menu</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>List</InlineCode> holds <InlineCode>ListItem</InlineCode> children
            identified by a React <InlineCode>key</InlineCode>. The <InlineCode>variant</InlineCode>{' '}
            is <InlineCode>standard</InlineCode> (flush) or <InlineCode>segmented</InlineCode>{' '}
            (rounded groups 2px apart).
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="images-video-lines-and-dividers" className="text-headline-small text-on-surface">
            Images, video, lines and dividers
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>ListItemImage</InlineCode> in <InlineCode>leading</InlineCode> is
              M3&apos;s 56dp image, cropped to fill. Pass <InlineCode>src</InlineCode>,{' '}
              <InlineCode>srcSet</InlineCode> and <InlineCode>sizes</InlineCode>, or your
              framework&apos;s image as its child. <InlineCode>fallback</InlineCode> (an icon) shows
              with no image or when it fails to load.
            </li>
            <li>
              <InlineCode>ListItemVideo</InlineCode> is a video&apos;s thumbnail, 100 × 56dp (
              <InlineCode>size=&quot;large&quot;</InlineCode>: 114 × 64dp), with a play badge and
              its <InlineCode>duration</InlineCode>. Pressing it is pressing the item.
            </li>
            <li>
              Images and videos have 8dp corners (M3 Expressive). Change them with the list&apos;s{' '}
              <InlineCode>classNames.media</InlineCode> or their own{' '}
              <InlineCode>className</InlineCode>. <InlineCode>ListItemAvatar</InlineCode> is
              M3&apos;s 40dp avatar: a photo, or initials on{' '}
              <InlineCode>primary-container</InlineCode>. Icons in the leading and trailing content
              are 20dp.
            </li>
            <li>
              <InlineCode>headlineLines</InlineCode> and{' '}
              <InlineCode>supportingTextLines</InlineCode> (1 to 3), on the list or an item, end
              long text with &quot;…&quot;; the full text stays in the accessible name. M3&apos;s
              limits are one line of supporting text in a two-line item and two in a three-line
              item. There are no limits by default.
            </li>
            <li>
              <InlineCode>dividers=&quot;full&quot;</InlineCode> or{' '}
              <InlineCode>&quot;inset&quot;</InlineCode> (16dp from each side) draws M3&apos;s
              dividers between items of a standard list. Segmented items are already apart, so they
              don&apos;t take dividers.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="which-list" className="text-headline-small text-on-surface">
            Which list
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Items that go to other pages (a settings menu, legal pages): link items (
              <InlineCode>href</InlineCode>, with <InlineCode>current</InlineCode> on the page being
              shown), in a list without <InlineCode>onAction</InlineCode>.
            </li>
            <li>
              An on/off setting that applies at once: a switch item (
              <InlineCode>control=&quot;switch&quot;</InlineCode>). Choosing several items: checkbox
              items (<InlineCode>control=&quot;checkbox&quot;</InlineCode>
              ).
            </li>
            <li>
              One choice out of a few, applied at once: a radio list (<InlineCode>value</InlineCode>{' '}
              / <InlineCode>onValueChange</InlineCode>, each item with a{' '}
              <InlineCode>value</InlineCode>
              ).
            </li>
            <li>
              An item that opens something and also has its own switch: an interactive list with a{' '}
              <InlineCode>Switch</InlineCode> in the item&apos;s trailing content.
            </li>
            <li>
              Many options, or choices inside a form with a submit button:{' '}
              <InlineCode>RadioGroup</InlineCode>, <InlineCode>Checkbox</InlineCode> or{' '}
              <InlineCode>Switch</InlineCode> on their own.
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
              Link items in a list without <InlineCode>onAction</InlineCode> or{' '}
              <InlineCode>selectionMode</InlineCode> are real links (
              <InlineCode>&lt;a href&gt;</InlineCode>): each is a Tab stop, Enter follows it, and
              the browser&apos;s link menu, status bar and new-tab clicks work. A plain click goes
              through the app&apos;s router (<InlineCode>NextRouterProvider</InlineCode>
              ). The link is the headline, with an overlay over the whole item, so buttons in the
              trailing content stay their own controls. <InlineCode>current</InlineCode> sets{' '}
              <InlineCode>aria-current=&quot;page&quot;</InlineCode>.
            </li>
            <li>
              With <InlineCode>selectionMode</InlineCode> (and no <InlineCode>onAction</InlineCode>{' '}
              or links) the list is a <InlineCode>listbox</InlineCode> of options, as M3 asks on the
              web, and selected items show a check besides their colour (
              <InlineCode>selectionIndicator=&#123;false&#125;</InlineCode> hides it). Options
              can&apos;t hold buttons or links. With <InlineCode>onAction</InlineCode> the list is a
              grid list where ← / → reach a trailing control (such as a switch). ↑ / ↓ move between
              items and wrap at the ends; typeahead jumps by headline.
            </li>
            <li>
              Press or Enter fires <InlineCode>onAction</InlineCode> with the item&apos;s key; in a
              selectable list it toggles selection (<InlineCode>selectedKeys</InlineCode> /{' '}
              <InlineCode>onSelectionChange</InlineCode>, <InlineCode>disabledKeys</InlineCode>).
            </li>
            <li>
              Items with <InlineCode>childItems</InlineCode> expand and collapse (a tree grid with{' '}
              <InlineCode>aria-expanded</InlineCode>): pressing the item or its chevron toggles it,
              → / ← expand and collapse it, and nested items are indented 16dp per level.{' '}
              <InlineCode>expandedKeys</InlineCode> / <InlineCode>onExpandedChange</InlineCode>{' '}
              control it.
            </li>
            <li>
              Without those props the list is a plain <InlineCode>ul</InlineCode>; only its link,
              switch and checkbox items take focus.
            </li>
            <li>
              A switch or checkbox item is one control: a native checkbox (with{' '}
              <InlineCode>role=&quot;switch&quot;</InlineCode> for switches) named by the headline
              and described by the overline and supporting text. Tab reaches each item; Space
              toggles it. They post with a form through <InlineCode>name</InlineCode> and{' '}
              <InlineCode>value</InlineCode>.
            </li>
            <li>
              A radio list is a <InlineCode>radiogroup</InlineCode> of native radio buttons: one Tab
              stop, and ↑ / ↓ move the choice.
            </li>
            <li>
              A name is required (<InlineCode>aria-label</InlineCode> or{' '}
              <InlineCode>aria-labelledby</InlineCode>); give a non-string headline a{' '}
              <InlineCode>textValue</InlineCode> for typeahead and announcements.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="spec-values-and-differences" className="text-headline-small text-on-surface">
            Spec values and differences
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Heights follow Compose: at least 56px (one line), 72px (overline or supporting text)
              and 88px (both); three-line items align to the top, others to the centre.
            </li>
            <li>
              Every <InlineCode>ListItem</InlineCode> and <InlineCode>SegmentedListItem</InlineCode>{' '}
              overload is covered: static items, clickable items (<InlineCode>onAction</InlineCode>,
              links), single selection (radio lists) and checkable items (switch and checkbox
              items). Checked and selected items take the selected colours and shape, as in Compose.
            </li>
            <li>
              Deviation: switch items have the switch role, so screen readers say on and off;
              Compose gives every checkable item the checkbox role, because Android lists have no
              switch role.
            </li>
            <li>
              Not included: long press (<InlineCode>onLongClick</InlineCode>). On the web, an action
              needs a way in for every pointer and keyboard, so put it in a menu from a trailing
              icon button.
            </li>
            <li>
              Shape precedence (pressed, then selected or focused at 16px, then hovered at 12px,
              else 4px) is computed into one <InlineCode>data-shape</InlineCode> that morphs on the
              fast spatial spring; segmented groups round their outer corners.
            </li>
            <li>
              Deviation: standard items are transparent rather than Compose&apos;s{' '}
              <InlineCode>surface</InlineCode>, so a list takes the colour of its sheet, card or
              pane. Not in v1: drag-to-reorder (and its dragged state) and swipe-to-reveal (Android
              only in M3).
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
