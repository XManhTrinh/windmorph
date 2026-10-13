import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { TagShortForms } from '../../examples/tag/tag-short-forms';
import { TagStatuses } from '../../examples/tag/tag-statuses';
import { TagTokens } from '../../examples/tag/tag-tokens';
import { TagVariants } from '../../examples/tag/tag-variants';
import { TagSizes } from '../../examples/tag/tag-sizes';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Tag page body: when to use it (and not a chip or a badge), examples, a11y and tokens. */
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
            title="Variants and tones"
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
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="keyboard-and-screen-reader" className="text-headline-small text-on-surface">
            Keyboard &amp; screen reader
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>A tag is plain text: it has no role and is never focusable.</li>
            <li>
              <InlineCode>fullLabel</InlineCode> replaces a short label for screen readers
              (&quot;M3E&quot; reads &quot;Expressive&quot;), and shows on hover.
            </li>
            <li>
              <InlineCode>TagGroup</InlineCode> is a list, so screen readers say how many tags there
              are; give it an <InlineCode>aria-label</InlineCode>.
            </li>
            <li>Dots and icons are decorative. In forced-colours mode every tag keeps a border.</li>
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
              Tones use M3&apos;s roles and the theme&apos;s success and warning roles. A test keeps
              every label at 4.5:1 in every theme, mode and contrast level.
            </li>
            <li>
              Set <InlineCode>--wm-tag-container</InlineCode>, <InlineCode>-content</InlineCode>,{' '}
              <InlineCode>-outline</InlineCode>, <InlineCode>-dot</InlineCode>,{' '}
              <InlineCode>-height</InlineCode>, <InlineCode>-padding-inline</InlineCode>,{' '}
              <InlineCode>-gap</InlineCode>, <InlineCode>-icon-size</InlineCode> or{' '}
              <InlineCode>-corner</InlineCode> on a tag or an ancestor.
            </li>
            <li>
              <InlineCode>tagTokens</InlineCode> exports every size and colour role, for building on
              the tag in code.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
