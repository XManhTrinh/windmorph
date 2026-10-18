import type { ComponentDoc } from './doc';
import { tagTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const TagShortForms = lazyExample('tag/tag-short-forms', 'TagShortForms');
const TagStatuses = lazyExample('tag/tag-statuses', 'TagStatuses');
const TagTokens = lazyExample('tag/tag-tokens', 'TagTokens');
const TagVariants = lazyExample('tag/tag-variants', 'TagVariants');
const TagSizes = lazyExample('tag/tag-sizes', 'TagSizes');

/** Tag page body: when to use it (and not a chip or a badge), examples and tokens. */
export async function TagBody(): Promise<ComponentDoc> {
  const [statuses, variants, shortForms, tokens] = await Promise.all([
    readExampleSource('tag/tag-statuses.tsx'),
    readExampleSource('tag/tag-variants.tsx'),
    readExampleSource('tag/tag-short-forms.tsx'),
    readExampleSource('tag/tag-tokens.tsx'),
  ]);
  const [statusesHtml, variantsHtml, shortFormsHtml, tokensHtml] = await Promise.all([
    highlightSource(statuses),
    highlightSource(variants),
    highlightSource(shortForms),
    highlightSource(tokens),
  ]);

  const sizesShapes = await readExampleSource('tag/tag-sizes.tsx');
  const sizesShapesHtml = await highlightSource(sizesShapes);
  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Statuses on a listing"
            code={statuses}
            html={statusesHtml}
            fileName="tag-statuses.tsx"
          >
            <TagStatuses />
          </ExampleViewer>
          <ExampleViewer
            title="Variants and colours"
            code={variants}
            html={variantsHtml}
            fileName="tag-variants.tsx"
          >
            <TagVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Sizes and shapes"
            code={sizesShapes}
            html={sizesShapesHtml}
            fileName="tag-sizes.tsx"
          >
            <TagSizes />
          </ExampleViewer>
          <ExampleViewer
            title="Short forms and long labels"
            code={shortForms}
            html={shortFormsHtml}
            fileName="tag-short-forms.tsx"
          >
            <TagShortForms />
          </ExampleViewer>
          <ExampleViewer
            title="Component tokens"
            code={tokens}
            html={tokensHtml}
            fileName="tag-tokens.tsx"
          >
            <TagTokens />
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
            A tag is a small, static label about the thing beside it: a status (Sold, Open now), a
            category (Full-time) or a quality (Featured). It never does anything when pressed. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>: it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode> and is built from M3&apos;s colour roles,
            type scale and shape scale, with its own component tokens.
          </p>
          <p className="text-body-large text-on-surface-variant">
            A short form (<InlineCode>fullLabel</InlineCode>) or a label cut at{' '}
            <InlineCode>maxWidth</InlineCode> shows its full text in the core&apos;s plain tooltip,
            on hover, keyboard focus or a long press; only such a tag takes focus, and a small one
            gets a 24px touch target for it.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="tag-badge-or-chip" className="text-headline-small text-on-surface">
            Tag, badge or chip?
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <strong className="text-on-surface">Tag</strong>: a word or two about an item, that
              does nothing when pressed.
            </li>
            <li>
              <strong className="text-on-surface">Badge</strong>: a count or a dot on an icon or an
              avatar (unread messages, new activity).
            </li>
            <li>
              <strong className="text-on-surface">Chips</strong>: interactive. Assist and suggestion
              chips act, filter chips filter, input chips are entered values. A tag styled as a chip
              would be focusable and read as a button.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming-and-tokens" className="text-headline-small text-on-surface">
            Theming &amp; tokens
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Colours use M3&apos;s roles and the theme&apos;s success and warning roles. A test
              keeps every label at 4.5:1 in every theme, mode and contrast level.
            </li>
            <li>
              The tokens below are set on a tag or an ancestor; each tag carries{' '}
              <InlineCode>data-tokens=&quot;wm-tag&quot;</InlineCode> and{' '}
              <InlineCode>data-palette=&quot;&lt;variant&gt;-&lt;color&gt;&quot;</InlineCode> (with{' '}
              <InlineCode>data-color</InlineCode> holding the colour alone), so a value set on an
              outer tag never leaks into a nested one. Their defaults follow the tag&apos;s size,
              shape (<InlineCode>square-corner</InlineCode> for{' '}
              <InlineCode>shape=&quot;square&quot;</InlineCode>), variant and colour.
            </li>
            <li>
              Its height is a minimum, so larger text makes it taller instead of spilling out.
            </li>
            <li>
              <InlineCode>tagTokens</InlineCode> exports every size and colour role, for building on
              the tag in code.
            </li>
          </ul>
          <TokenTable set={tagTokenSet} caption="Tag tokens" />
        </section>
      </>
    ),
  };
}
