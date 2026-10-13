import { ExampleViewer } from '../../components/example-viewer';
import { TooltipPlain } from '../../examples/tooltip/tooltip-plain';
import { TooltipRich } from '../../examples/tooltip/tooltip-rich';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Tooltip page body: plain and rich tooltips. */
export async function TooltipBody() {
  const [plain, rich] = await Promise.all([
    readExampleSource('tooltip/tooltip-plain.tsx'),
    readExampleSource('tooltip/tooltip-rich.tsx'),
  ]);
  const [plainHtml, richHtml] = await Promise.all([highlightSource(plain), highlightSource(rich)]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
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

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer title="Plain" code={plain} html={plainHtml} fileName="tooltip-plain.tsx">
          <TooltipPlain />
        </ExampleViewer>
        <ExampleViewer title="Rich" code={rich} html={richHtml} fileName="tooltip-rich.tsx">
          <TooltipRich />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A plain tooltip shows while its trigger is hovered or keyboard-focused, or after a touch
            long press, and describes the trigger (<InlineCode>aria-describedby</InlineCode>). It
            stays while the pointer is over it and for 1.5 seconds after it leaves (
            <InlineCode>closeDelay</InlineCode>); Escape hides it.
          </li>
          <li>
            A rich tooltip is transient by default: it opens like a plain tooltip, is a{' '}
            <InlineCode>role=&quot;tooltip&quot;</InlineCode> describing its trigger, and stays
            while the pointer or focus is inside it. With <InlineCode>persistent</InlineCode>, a
            press opens it as a non-modal popover dialog whose actions keyboard users can reach;
            press again, Escape, or a press outside closes it. A persistent one is named by its{' '}
            <InlineCode>title</InlineCode> or by <InlineCode>aria-label</InlineCode>.
          </li>
          <li>
            A focus-triggered tooltip does not auto-hide (it stays until blur, leave or Escape),
            following WCAG 1.4.13.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
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
            and the optional 16×8 caret adds 8px) and keep 8px from the screen edge. Plain tooltips
            default to <InlineCode>top</InlineCode>, rich ones to{' '}
            <InlineCode>bottom start</InlineCode> (bottom right in left-to-right layouts). They
            expand from the anchor&apos;s side along one axis while fading in, rather than scaling,
            since the spec avoids scale motion.
          </li>
        </ul>
      </section>
    </>
  );
}
