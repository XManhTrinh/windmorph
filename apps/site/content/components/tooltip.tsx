import { ExampleViewer } from '../../components/example-viewer';
import { TooltipPlain } from '../../examples/tooltip/tooltip-plain';
import { TooltipRich } from '../../examples/tooltip/tooltip-rich';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

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
          Both forms wrap their trigger: <code className="text-on-surface">TooltipTrigger</code>{' '}
          with a <code className="text-on-surface">Tooltip</code>, or{' '}
          <code className="text-on-surface">RichTooltipTrigger</code> with a{' '}
          <code className="text-on-surface">RichTooltip</code>. The trigger must read{' '}
          <code className="text-on-surface">TriggerContext</code>, which the library buttons already
          do.
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
            A plain tooltip shows while its trigger is hovered or keyboard-focused and describes the
            trigger (<code className="text-on-surface">aria-describedby</code>). It stays while the
            pointer is over it; Escape hides it.
          </li>
          <li>
            A rich tooltip opens on press (it can hold actions, so it is a non-modal popover
            dialog). Press again, Escape, or a press outside closes it. It is named by its{' '}
            <code className="text-on-surface">title</code> or by{' '}
            <code className="text-on-surface">aria-label</code>.
          </li>
          <li>
            A focus-triggered plain tooltip does not auto-hide (it stays until blur, leave or
            Escape), following WCAG 1.4.13.
          </li>
          <li>
            Plain tooltips do not open on a touch long-press — React Aria tooltips are pointer and
            keyboard only.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Plain tooltips are <code className="text-on-surface">inverse-surface</code> with{' '}
            <code className="text-on-surface">body-small</code> text, up to 200px wide, 4px corners;
            rich tooltips are <code className="text-on-surface">surface-container</code> at level 2,
            up to 320px, 12px corners.
          </li>
          <li>
            <code className="text-on-surface">delay</code> and{' '}
            <code className="text-on-surface">closeDelay</code> default to 0, because Compose shows
            at once.
          </li>
          <li>
            Both sit 4px from the anchor (12px with the optional 16×8 caret) and scale from 80% on
            fast spatial while fading in, from the anchor&apos;s side.
          </li>
          <li>
            The persistent-on-press behaviour of the rich tooltip matches Compose&apos;s persistent
            rich tooltip.
          </li>
        </ul>
      </section>
    </>
  );
}
