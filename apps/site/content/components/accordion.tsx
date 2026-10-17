import type { ComponentDoc } from './doc';
import { accordionTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const AccordionFaq = lazyExample('accordion/accordion-faq', 'AccordionFaq');
const AccordionSegmented = lazyExample('accordion/accordion-segmented', 'AccordionSegmented');
const AccordionMultiple = lazyExample('accordion/accordion-multiple', 'AccordionMultiple');
const AccordionParts = lazyExample('accordion/accordion-parts', 'AccordionParts');
const AccordionLongPanel = lazyExample('accordion/accordion-long-panel', 'AccordionLongPanel');
const AccordionDense = lazyExample('accordion/accordion-dense', 'AccordionDense');
const AccordionFindInPage = lazyExample('accordion/accordion-find-in-page', 'AccordionFindInPage');

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;

/** Accordion page body: purpose, examples, behaviour, the parts and tokens. */
export async function AccordionBody(): Promise<ComponentDoc> {
  const sources = await Promise.all([
    readExampleSource('accordion/accordion-faq.tsx'),
    readExampleSource('accordion/accordion-segmented.tsx'),
    readExampleSource('accordion/accordion-multiple.tsx'),
    readExampleSource('accordion/accordion-parts.tsx'),
    readExampleSource('accordion/accordion-long-panel.tsx'),
    readExampleSource('accordion/accordion-dense.tsx'),
    readExampleSource('accordion/accordion-find-in-page.tsx'),
  ]);
  const [faq, segmented, multiple, parts, longPanel, dense, findInPage] = sources;
  const [faqHtml, segmentedHtml, multipleHtml, partsHtml, longPanelHtml, denseHtml, findHtml] =
    await Promise.all(sources.map((source) => highlightSource(source)));

  return {
    overview: (
      <section className="flex flex-col gap-6">
        <h2 id="examples" className="text-headline-small text-on-surface">
          Examples
        </h2>
        <ExampleViewer
          title="A FAQ, one answer open"
          code={faq}
          html={faqHtml!}
          fileName="accordion-faq.tsx"
        >
          <AccordionFaq />
        </ExampleViewer>
        <ExampleViewer
          title="Several open at once (allowsMultipleExpanded), controlled"
          code={multiple}
          html={multipleHtml!}
          fileName="accordion-multiple.tsx"
        >
          <AccordionMultiple />
        </ExampleViewer>
        <ExampleViewer
          title="Segmented"
          code={segmented}
          html={segmentedHtml!}
          fileName="accordion-segmented.tsx"
        >
          <AccordionSegmented />
        </ExampleViewer>
        <ExampleViewer
          title="A header from parts, and a disabled item"
          code={parts}
          html={partsHtml!}
          fileName="accordion-parts.tsx"
        >
          <AccordionParts />
        </ExampleViewer>
        <ExampleViewer
          title="A long panel with a link"
          code={longPanel}
          html={longPanelHtml!}
          fileName="accordion-long-panel.tsx"
        >
          <AccordionLongPanel />
        </ExampleViewer>
        <ExampleViewer
          title="Density −3"
          code={dense}
          html={denseHtml!}
          fileName="accordion-dense.tsx"
        >
          <AccordionDense />
        </ExampleViewer>
        <ExampleViewer
          title="A link into a closed panel"
          code={findInPage}
          html={findHtml!}
          fileName="accordion-find-in-page.tsx"
        >
          <AccordionFindInPage />
        </ExampleViewer>
      </section>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className={TEXT}>
            A vertical stack of headers that open and fold panels of content: FAQs, settings groups,
            product details and filter groups. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>. It is designed to M3&apos;s guidelines:
            the headers are list items, with the list&apos;s tokens, type, heights and density, and
            the panels open on Expressive springs.
          </p>
          <p className={TEXT}>
            One item opens at a time by default, which keeps a long list short; pass{' '}
            <InlineCode>allowsMultipleExpanded</InlineCode> to let several stay open, when people
            compare panels or work through them in any order.
          </p>
          <p className={TEXT}>
            Use Collapse for one region your own control opens, a List with{' '}
            <InlineCode>childItems</InlineCode> for nested rows, and Tabs for peer views the person
            switches between.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              One item is open at a time, and it can fold fully;{' '}
              <InlineCode>allowsMultipleExpanded</InlineCode> lets several stay open. The open items
              are <InlineCode>expandedKeys</InlineCode> (controlled) or{' '}
              <InlineCode>defaultExpandedKeys</InlineCode>, by each item&apos;s{' '}
              <InlineCode>id</InlineCode>, and <InlineCode>onExpandedChange</InlineCode> gets the
              new set.
            </li>
            <li>
              <InlineCode>standard</InlineCode> items are transparent rows with a divider between
              them. <InlineCode>segmented</InlineCode> items are containers 2px apart, with a
              segmented list&apos;s corners: small at rest, rounder when hovered, and fully round
              while open, focused or pressed, on the fast spatial spring.
            </li>
            <li>
              Panels open on the default spatial spring and fold on the effects spring&apos;s
              easing, so a folding panel never bounces. Opening one item as another folds moves both
              together, so the accordion keeps its height on every frame. The chevron turns over on
              the fast spatial spring.
            </li>
            <li>
              Closed panels stay in the page as{' '}
              <InlineCode>hidden=&quot;until-found&quot;</InlineCode>: the browser&apos;s
              find-in-page and a <InlineCode>#fragment</InlineCode> link open the panel holding the
              match, and closed answers are in the server&apos;s HTML for search engines. Safari
              before 26.2 can&apos;t find text in a closed panel (26.2 finds it but may not scroll
              to it); its panels still open from their headers as everywhere else.
            </li>
            <li>
              An item takes a <InlineCode>title</InlineCode> (with <InlineCode>leading</InlineCode>{' '}
              content, <InlineCode>supportingText</InlineCode> and an{' '}
              <InlineCode>expandIcon</InlineCode>) and its panel content as children; for a header
              of your own, compose an <InlineCode>AccordionHeader</InlineCode> and an{' '}
              <InlineCode>AccordionPanel</InlineCode> instead. An{' '}
              <InlineCode>AccordionItem</InlineCode> on its own takes{' '}
              <InlineCode>expanded</InlineCode>, <InlineCode>defaultExpanded</InlineCode> and{' '}
              <InlineCode>onExpandedChange</InlineCode>.
            </li>
            <li>
              <InlineCode>density</InlineCode> takes 4px a step off the headers, as a core
              list&apos;s rows: 56px at 0 and 44px at −3 for one line.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <section className="flex flex-col gap-3">
        <h2 id="theming-and-tokens" className="text-headline-small text-on-surface">
          Theming &amp; tokens
        </h2>
        <p className={TEXT}>
          Set the tokens below on the accordion or any ancestor. The headers are list items, so they
          also take the core list&apos;s <InlineCode>--md-comp-list-list-item-*</InlineCode> tokens
          (heights, colours, type), and the panels take Collapse&apos;s{' '}
          <InlineCode>--wm-collapse-*</InlineCode> timing. Style the parts with{' '}
          <InlineCode>classNames</InlineCode> (<InlineCode>root</InlineCode>,{' '}
          <InlineCode>item</InlineCode>, <InlineCode>heading</InlineCode>,{' '}
          <InlineCode>header</InlineCode>, <InlineCode>leading</InlineCode>,{' '}
          <InlineCode>title</InlineCode>, <InlineCode>supportingText</InlineCode>,{' '}
          <InlineCode>chevron</InlineCode>, <InlineCode>panel</InlineCode>,{' '}
          <InlineCode>content</InlineCode>), on the accordion for every item or on one item.
        </p>
        <TokenTable set={accordionTokenSet} caption="Accordion tokens" />
      </section>
    ),
  };
}
