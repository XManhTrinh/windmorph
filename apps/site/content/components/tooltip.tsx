import { plainTooltipTokenSet, richTooltipTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const TooltipPlain = lazyExample('tooltip/tooltip-plain', 'TooltipPlain');
const TooltipRich = lazyExample('tooltip/tooltip-rich', 'TooltipRich');
const TooltipRichConfigurations = lazyExample(
  'tooltip/tooltip-rich-configurations',
  'TooltipRichConfigurations',
);

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
    tokens: [plainTooltipTokenSet, richTooltipTokenSet],
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
          <p className="text-body-large text-on-surface-variant">
            Avoid persistent rich tooltips on icon buttons, as M3 advises: an icon button needs its
            plain tooltip to say what it does, and a persistent tooltip would take over its press.
            Open persistent rich tooltips from a dedicated control, such as an information button
            beside the text they explain.
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
              Plain tooltips are <InlineCode>inverse-surface</InlineCode> with{' '}
              <InlineCode>body-small</InlineCode> text, up to 200px wide, 4px corners; rich tooltips
              are <InlineCode>surface-container</InlineCode> at level 2, up to 320px, 12px corners,
              with 12px above and 8px below the text when there is no subhead or action.
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
