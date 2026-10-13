import { ExampleViewer } from '../../components/example-viewer';
import { AvatarBadges } from '../../examples/avatar/avatar-badges';
import { AvatarFallbacks } from '../../examples/avatar/avatar-fallbacks';
import { AvatarGroupExample } from '../../examples/avatar/avatar-group';
import { AvatarShapes } from '../../examples/avatar/avatar-shapes';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const EXAMPLES = [
  { file: 'avatar/avatar-fallbacks.tsx', title: 'Fallbacks and sizes', Example: AvatarFallbacks },
  { file: 'avatar/avatar-shapes.tsx', title: 'All 35 Expressive shapes', Example: AvatarShapes },
  { file: 'avatar/avatar-badges.tsx', title: 'Presence and badges', Example: AvatarBadges },
  { file: 'avatar/avatar-group.tsx', title: 'Groups', Example: AvatarGroupExample },
] as const;

/** Avatar page body: purpose, examples, accessibility and theming. */
export async function AvatarBody() {
  const examples = await Promise.all(
    EXAMPLES.map(async (example) => {
      const code = await readExampleSource(example.file);
      return { ...example, code, html: await highlightSource(code) };
    }),
  );

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          An avatar is a small picture that stands for an account, with initials or an icon when
          there is no photo. It is <strong className="text-on-surface">not an M3 component</strong>:
          it comes from <code className="text-on-surface">@windmorph/react-pro</code> and fits the
          avatar slots of M3 components, such as the 24px avatar of an input chip and the 40px
          leading avatar of a list item.
        </p>
        <p className="text-body-large text-on-surface-variant">
          It renders on the server. The photo sits over the fallback, so it shows as soon as it
          loads, with or without JS; if it fails, the fallback shows. Pass{' '}
          <code className="text-on-surface">image</code> to use your framework&apos;s image
          component, such as <code className="text-on-surface">next/image</code>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">shape</code> is{' '}
          <code className="text-on-surface">circle</code> by default, or{' '}
          <code className="text-on-surface">rounded</code> (a shape-scale corner for its size), or
          any of the 35 M3 Expressive shapes. <code className="text-on-surface">icon</code> sets the
          fallback when there is no name.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        {examples.map(({ file, title, code, html, Example }) => (
          <ExampleViewer
            key={file}
            title={title}
            code={code}
            html={html}
            fileName={file.split('/')[1] ?? file}
          >
            <Example />
          </ExampleViewer>
        ))}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A static avatar is an image named by <code className="text-on-surface">alt</code>, or
            hidden with <code className="text-on-surface">decorative</code> when the name is written
            next to it. The types require one of the two.
          </li>
          <li>
            Presence and the badge&apos;s <code className="text-on-surface">badgeLabel</code> join
            the name (&quot;Sam, online, verified&quot;); pass{' '}
            <code className="text-on-surface">labels</code> to translate them.
          </li>
          <li>
            With <code className="text-on-surface">href</code> or{' '}
            <code className="text-on-surface">onPress</code> it is a link or button with a state
            layer, a focus ring and a 48px touch target.
          </li>
          <li>
            <code className="text-on-surface">AvatarGroup</code> is read once by its{' '}
            <code className="text-on-surface">label</code>; its static avatars become decorative.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">tone=&quot;auto&quot;</code> hashes the name into one
            of 12 colour slots, so a name keeps its colour. By default the slots cycle through the
            primary, secondary, tertiary and neutral containers, so they follow every theme, mode
            and contrast level. Give an app more colours by setting{' '}
            <code className="text-on-surface">--wm-avatar-tone-1</code> …{' '}
            <code className="text-on-surface">--wm-avatar-tone-12</code> and their{' '}
            <code className="text-on-surface">--wm-avatar-on-tone-*</code> text colours (any colour:
            a theme variable, hex, <code className="text-on-surface">oklch()</code>).
          </li>
          <li>
            Status colours default to M3 roles (online{' '}
            <code className="text-on-surface">primary</code>, away{' '}
            <code className="text-on-surface">tertiary</code>, offline an{' '}
            <code className="text-on-surface">outline</code> ring, badge{' '}
            <code className="text-on-surface">primary</code>). Override them with{' '}
            <code className="text-on-surface">--wm-avatar-online</code>,{' '}
            <code className="text-on-surface">--wm-avatar-away</code>,{' '}
            <code className="text-on-surface">--wm-avatar-offline</code>,{' '}
            <code className="text-on-surface">--wm-avatar-badge</code> and{' '}
            <code className="text-on-surface">--wm-avatar-on-badge</code>.
          </li>
          <li>
            Set the variables on <code className="text-on-surface">:root</code>, a section or one
            avatar, in CSS or with Tailwind (
            <code className="text-on-surface">[--wm-avatar-tone-1:#16a34a]</code>). Tailwind classes
            on the parts win too:{' '}
            <code className="text-on-surface">
              classNames=&#123;&#123; visual: &apos;bg-green-600 text-white&apos; &#125;&#125;
            </code>
            .
          </li>
          <li>
            Rounded squares take a corner from the shape scale for their size; Expressive shapes are
            masks, so they scale with the avatar.
          </li>
          <li>
            Initials are whole graphemes in the locale&apos;s casing, so accented letters stay with
            their letters (&quot;Élodie Dubois&quot; → &quot;ÉD&quot;).
          </li>
        </ul>
      </section>
    </>
  );
}
