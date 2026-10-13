import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { TooltipPlain } from '../../examples/tooltip/tooltip-plain';
import { TooltipRich } from '../../examples/tooltip/tooltip-rich';
import { TooltipRichConfigurations } from '../../examples/tooltip/tooltip-rich-configurations';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Tooltip page body: plain and rich tooltips. */
export async function TooltipBody(): Promise<ComponentDoc> {
  const [plain, rich] = await Promise.all([
    readExampleSource('tooltip/tooltip-plain.tsx'),
    readExampleSource('tooltip/tooltip-rich.tsx'),
  ]);
  const [plainHtml, richHtml] = await Promise.all([highlightSource(plain), highlightSource(rich)]);

  const richConfigurations = await readExampleSource('tooltip/tooltip-rich-configurations.tsx');
  const richConfigurationsHtml = await highlightSource(richConfigurations);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer title="Plain" code={plain} html={plainHtml} fileName="tooltip-plain.tsx">
            <TooltipPlain />
          </ExampleViewer>
          <ExampleViewer title="Rich" code={rich} html={richHtml} fileName="tooltip-rich.tsx">
            <TooltipRich />
          </ExampleViewer>
          <ExampleViewer
            title="Rich tooltip configurations"
            code={richConfigurations}
            html={richConfigurationsHtml}
            fileName="tooltip-rich-configurations.tsx"
          >
            <TooltipRichConfigurations />
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
            A tooltip gives a brief hint about an element. A plain tooltip is a short label for a
            control such as an icon button; a rich tooltip adds a subhead, supporting text and an
            optional action for a little more context. For a message that needs a response use a
            dialog, not a tooltip.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Both forms wrap their trigger: <InlineCode>TooltipTrigger</InlineCode> with a{' '}
            <InlineCode>Tooltip</InlineCode>, or <InlineCode>RichTooltipTrigger</InlineCode> with a{' '}
            <InlineCode>RichTooltip</InlineCode>. The trigger must read{' '}
            <InlineCode>TriggerContext</InlineCode>, which the library buttons already do.
          </p>
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
              A plain tooltip shows while its trigger is hovered or keyboard-focused, or after a
              touch long press, and describes the trigger (<InlineCode>aria-describedby</InlineCode>
              ). It stays while the pointer is over it and for 1.5 seconds after it leaves (
              <InlineCode>closeDelay</InlineCode>); Escape hides it.
            </li>
            <li>
              A rich tooltip is transient by default: it opens like a plain tooltip, is a{' '}
              <InlineCode>role=&quot;tooltip&quot;</InlineCode> describing its trigger, and stays
              while the pointer or focus is inside it. With <InlineCode>persistent</InlineCode>, a
              press opens it as a non-modal popover dialog whose actions keyboard users can reach;
              it stays when the pointer leaves, and pressing the trigger again, Escape, or a press
              anywhere outside it closes it. A persistent one is named by its{' '}
              <InlineCode>title</InlineCode> or by <InlineCode>aria-label</InlineCode>. Opening it
              leaves focus on the trigger, and it comes next in the Tab order (see below).
            </li>
            <li>
              A focus-triggered tooltip does not auto-hide (it stays until blur, leave or Escape),
              following WCAG 1.4.13.
            </li>
            <li>
              A persistent rich tooltip is a non-modal{' '}
              <InlineCode>role=&quot;dialog&quot;</InlineCode> (no{' '}
              <InlineCode>aria-modal</InlineCode>), so screen readers don&apos;t announce a modal;
              its trigger has <InlineCode>aria-expanded</InlineCode> and{' '}
              <InlineCode>aria-controls</InlineCode> pointing at it. It never traps focus.
            </li>
          </ul>
          <div className="overflow-x-auto rounded-corner-large border border-outline-variant">
            <table className="w-full text-start text-body-medium text-on-surface">
              <caption className="sr-only">Tooltip keyboard interactions</caption>
              <thead className="bg-surface-container text-label-large text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start">
                    Key
                  </th>
                  <th scope="col" className="px-4 py-3 text-start">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-outline-variant align-top">
                  <th scope="row" className="px-4 py-3 text-start font-plain whitespace-nowrap">
                    <kbd>Tab</kbd>
                  </th>
                  <td className="px-4 py-3 text-on-surface-variant">
                    On a trigger with a persistent rich tooltip open: moves into it, to its first
                    link or button. From its last control: on to whatever follows the trigger on the
                    page, which closes it, since focus moved to another element.
                  </td>
                </tr>
                <tr className="border-t border-outline-variant align-top">
                  <th scope="row" className="px-4 py-3 text-start font-plain whitespace-nowrap">
                    <kbd>Shift+Tab</kbd>
                  </th>
                  <td className="px-4 py-3 text-on-surface-variant">
                    Back through the tooltip&apos;s controls to its trigger. From whatever follows
                    the trigger: into the tooltip, at its last control.
                  </td>
                </tr>
                <tr className="border-t border-outline-variant align-top">
                  <th scope="row" className="px-4 py-3 text-start font-plain whitespace-nowrap">
                    <kbd>Enter or Space</kbd>
                  </th>
                  <td className="px-4 py-3 text-on-surface-variant">
                    On a persistent trigger: opens or closes its rich tooltip. Focus stays on the
                    trigger.
                  </td>
                </tr>
                <tr className="border-t border-outline-variant align-top">
                  <th scope="row" className="px-4 py-3 text-start font-plain whitespace-nowrap">
                    <kbd>Escape</kbd>
                  </th>
                  <td className="px-4 py-3 text-on-surface-variant">
                    Hides a plain or transient tooltip. Closes a persistent rich tooltip from its
                    trigger or from inside it, with focus back on the trigger.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
              Plain tooltips are <InlineCode>inverse-surface</InlineCode> with{' '}
              <InlineCode>body-small</InlineCode> text, up to 200px wide, 4px corners; rich tooltips
              are <InlineCode>surface-container</InlineCode> at level 2, up to 320px, 12px corners,
              with 12px above and 8px below plain text.
            </li>
            <li>
              <InlineCode>delay</InlineCode> defaults to 0, because Compose shows at once;{' '}
              <InlineCode>closeDelay</InlineCode> is the spec&apos;s 1.5s.
            </li>
            <li>
              Both sit 4px from the anchor (<InlineCode>offset</InlineCode>; use 8 for text anchors,
              and the optional 16×8 caret adds 8px) and keep 8px from the screen edge. Plain
              tooltips default to <InlineCode>top</InlineCode>, rich ones to{' '}
              <InlineCode>bottom start</InlineCode> (bottom right in left-to-right layouts); in a
              top app bar or search app bar, plain tooltips open below (
              <InlineCode>TooltipPlacementContext</InlineCode>). At the screen edge they keep their
              natural width and move inside the margin. They expand from the anchor&apos;s side
              along one axis while fading in, rather than scaling, since the spec avoids scale
              motion.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
