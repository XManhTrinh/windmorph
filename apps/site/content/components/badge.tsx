import { badgeTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const BadgeBasic = lazyExample('badge/badge-basic', 'BadgeBasic');
const BadgeNavigation = lazyExample('badge/badge-navigation', 'BadgeNavigation');

/** Badge page body: small and large badges, alone and on anchors. */
export async function BadgeBody(): Promise<ComponentDoc> {
  const basic = await readExampleSource('badge/badge-basic.tsx');
  const basicHtml = await highlightSource(basic);
  const navigation = await readExampleSource('badge/badge-navigation.tsx');
  const navigationHtml = await highlightSource(navigation);

  return {
    tokens: [badgeTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Badges and anchors"
            code={basic}
            html={basicHtml}
            fileName="badge-basic.tsx"
          >
            <BadgeBasic />
          </ExampleViewer>
          <ExampleViewer
            title="On navigation items"
            code={navigation}
            html={navigationHtml}
            fileName="badge-navigation.tsx"
          >
            <BadgeNavigation />
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
            A badge marks an item as having new or unread content — a small dot for a plain signal,
            or a large badge carrying a short count or label. Place it on an icon with{' '}
            <InlineCode>BadgedBox</InlineCode>, for example on a navigation icon or an icon button.
          </p>
          <p className="text-body-large text-on-surface-variant">
            A <InlineCode>Badge</InlineCode> with no children is the small dot; with children it is
            the large badge. Keep large badges to four characters, including a &quot;+&quot;:
            numbers are capped at <InlineCode>max</InlineCode> (999 by default, so
            &quot;999+&quot;), and longer text is truncated at the badge&apos;s 34px maximum width.
          </p>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="spec-values" className="text-headline-small text-on-surface">
            Spec values
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              No children is the small 6px dot; children give the large badge (16px tall, at least
              16px wide, with text over four characters cut at 34px, full corners, 4px side padding,{' '}
              <InlineCode>label-small</InlineCode>), both in <InlineCode>error</InlineCode> /{' '}
              <InlineCode>on-error</InlineCode>.
            </li>
            <li>
              <InlineCode>BadgedBox</InlineCode> places the badge like Compose: a small badge 6px
              inside the anchor&apos;s end at the top, a large one 12px inside the end hanging 2px
              above and past it.
            </li>
            <li>
              Positioning uses a shared grid cell and a zero-size box, so the badge overflows
              without changing the anchor&apos;s size and mirrors in RTL; Compose&apos;s badge
              rulers (clamping to an outer bound) aren&apos;t ported.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
