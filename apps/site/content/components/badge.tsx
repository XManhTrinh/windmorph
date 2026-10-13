import { ExampleViewer } from '../../components/example-viewer';
import { BadgeBasic } from '../../examples/badge/badge-basic';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Badge page body: small and large badges, alone and on anchors. */
export async function BadgeBody() {
  const basic = await readExampleSource('badge/badge-basic.tsx');
  const basicHtml = await highlightSource(basic);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A badge marks an item as having new or unread content — a small dot for a plain signal, or
          a large badge carrying a short count or label. Place it on an icon with{' '}
          <code className="text-on-surface">BadgedBox</code>, for example on a navigation icon or an
          icon button.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A <code className="text-on-surface">Badge</code> with no children is the small dot; with
          children it is the large badge. Because the badge itself is decorative, give the anchor an
          accessible name that includes the badge&apos;s meaning, such as &quot;Inbox, 3 new&quot;.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Badges and anchors"
          code={basic}
          html={basicHtml}
          fileName="badge-basic.tsx"
        >
          <BadgeBasic />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>A badge adds no interaction of its own; it rides on whatever it is placed on.</li>
          <li>
            The badge&apos;s number or dot is not announced on its own, so put its meaning in the
            anchor&apos;s accessible name (e.g. an{' '}
            <code className="text-on-surface">IconButton</code> labelled &quot;Messages, 12
            unread&quot;).
          </li>
          <li>
            A bare SVG anchor gets Compose&apos;s default 24px icon size; wrap it in a sized element
            for other sizes.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            No children is Compose&apos;s small 6px dot; children give the large badge (at least
            16px, full corners, 4px side padding,{' '}
            <code className="text-on-surface">label-small</code>), both in{' '}
            <code className="text-on-surface">error</code> /{' '}
            <code className="text-on-surface">on-error</code>.
          </li>
          <li>
            <code className="text-on-surface">BadgedBox</code> places the badge like Compose: a
            small badge 6px inside the anchor&apos;s end at the top, a large one 12px inside the end
            hanging 2px above and past it.
          </li>
          <li>
            Positioning uses a shared grid cell and a zero-size box, so the badge overflows without
            changing the anchor&apos;s size and mirrors in RTL; Compose&apos;s badge rulers
            (clamping to an outer bound) aren&apos;t ported.
          </li>
        </ul>
      </section>
    </>
  );
}
