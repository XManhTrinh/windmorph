import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { ListDetailInbox } from '../../examples/list-detail-layout/list-detail-inbox';
import { ListDetailSettings } from '../../examples/list-detail-layout/list-detail-settings';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** List-detail layout page body: when to use it, examples, accessibility and theming. */
export async function ListDetailLayoutBody(): Promise<ComponentDoc> {
  const [settings, inbox] = await Promise.all([
    readExampleSource('list-detail-layout/list-detail-settings.tsx'),
    readExampleSource('list-detail-layout/list-detail-inbox.tsx'),
  ]);
  const [settingsHtml, inboxHtml] = await Promise.all([
    highlightSource(settings),
    highlightSource(inbox),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Settings"
            code={settings}
            html={settingsHtml}
            fileName="list-detail-settings.tsx"
          >
            <ListDetailSettings />
          </ExampleViewer>
          <ExampleViewer
            title="An inbox, with filled panes"
            code={inbox}
            html={inboxHtml}
            fileName="list-detail-inbox.tsx"
          >
            <ListDetailInbox />
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
            The list-detail layout shows a list of items and the one that&apos;s open. Below 840px
            one pane shows at a time: the list, or the open item with a way back. From 840px the
            list sits beside the open item, so people can move between items without losing their
            place. It is <strong className="text-on-surface">not an M3 component</strong>: M3
            defines list-detail as a canonical layout, and this one comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>, built from M3&apos;s window size classes,
            pane widths and spacer, colour roles, shapes and the shared axis transition.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Use Tabs for a few peer views of the same thing, and a Dialog for a short task that
            doesn&apos;t need its own URL.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="panes-and-window-sizes" className="text-headline-small text-on-surface">
            Panes and window sizes
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <strong className="text-on-surface">Compact and medium</strong> (below 840px): one
              pane, chosen by <InlineCode>active</InlineCode>. The <InlineCode>back</InlineCode>{' '}
              slot shows at the top of the open item.
            </li>
            <li>
              <strong className="text-on-surface">Expanded and wider</strong> (840px and up): both
              panes, a fixed list (360px, 412px from 1200px, or <InlineCode>listWidth</InlineCode>)
              beside a flexible detail, with M3&apos;s 24px spacer. The list is sticky; set{' '}
              <InlineCode>stickyTop</InlineCode> to stop it below a sticky top app bar.
            </li>
            <li>
              <strong className="text-on-surface">URL-driven:</strong> in an app, make the list
              items links (<InlineCode>href</InlineCode>) and pass <InlineCode>active</InlineCode>{' '}
              from the route: <InlineCode>&quot;list&quot;</InlineCode> on the list&apos;s route,{' '}
              <InlineCode>&quot;detail&quot;</InlineCode> on an item&apos;s. The panes switch with
              CSS, so a server-rendered page never jumps. Render it in a shared route layout so it
              stays mounted between items.
            </li>
            <li>
              <InlineCode>variant</InlineCode>: <InlineCode>plain</InlineCode> (the default) puts
              the panes on the page&apos;s surface; <InlineCode>filled</InlineCode> makes each a{' '}
              <InlineCode>surface-container-low</InlineCode> container with large corners.
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
              Each pane is a labelled landmark: the list a navigation region (or a section with{' '}
              <InlineCode>listAs=&quot;section&quot;</InlineCode>), the open item a section. A
              hidden pane is out of the accessibility tree.
            </li>
            <li>
              Pass <InlineCode>detailKey</InlineCode> (usually the pathname): when it changes below
              840px, focus moves to the pane that&apos;s now showing, so people land on the new
              content. From 840px focus stays on the item they chose.
            </li>
            <li>
              Below 840px the incoming pane slides in along the shared axis; a page load never
              animates, and with reduced motion it appears at once. In right-to-left the list sits
              on the right and the motion mirrors.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming" className="text-headline-small text-on-surface">
            Theming
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Only colour roles: filled panes use <InlineCode>surface-container-low</InlineCode>,
              and keep a border in forced-colours mode, so it follows every theme, mode and contrast
              level.
            </li>
            <li>
              Override any part with <InlineCode>className</InlineCode> and{' '}
              <InlineCode>classNames</InlineCode> (root, list, detail, back).
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
