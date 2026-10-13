import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { AvatarBadges } from '../../examples/avatar/avatar-badges';
import { AvatarFallbacks } from '../../examples/avatar/avatar-fallbacks';
import { AvatarGroupExample } from '../../examples/avatar/avatar-group';
import { AvatarShapes } from '../../examples/avatar/avatar-shapes';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

const EXAMPLES = [
  { file: 'avatar/avatar-fallbacks.tsx', title: 'Fallbacks and sizes', Example: AvatarFallbacks },
  { file: 'avatar/avatar-shapes.tsx', title: 'All 35 Expressive shapes', Example: AvatarShapes },
  { file: 'avatar/avatar-badges.tsx', title: 'Presence and badges', Example: AvatarBadges },
  { file: 'avatar/avatar-group.tsx', title: 'Groups', Example: AvatarGroupExample },
] as const;

/** Avatar page body: purpose, examples, accessibility and theming. */
export async function AvatarBody(): Promise<ComponentDoc> {
  const examples = await Promise.all(
    EXAMPLES.map(async (example) => {
      const code = await readExampleSource(example.file);
      return { ...example, code, html: await highlightSource(code) };
    }),
  );

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            An avatar is a small picture that stands for an account, with initials or an icon when
            there is no photo. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>: it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode> and fits the avatar slots of M3
            components, such as the 24px avatar of an input chip and the 40px leading avatar of a
            list item.
          </p>
          <p className="text-body-large text-on-surface-variant">
            It renders on the server. The photo sits over the fallback, so it shows as soon as it
            loads, with or without JS; if it fails, the fallback shows. Pass{' '}
            <InlineCode>image</InlineCode> to use your framework&apos;s image component, such as{' '}
            <InlineCode>next/image</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>shape</InlineCode> is <InlineCode>circle</InlineCode> by default, or{' '}
            <InlineCode>rounded</InlineCode> (a shape-scale corner for its size), or any of the 35
            M3 Expressive shapes. <InlineCode>icon</InlineCode> sets the fallback when there is no
            name.
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
              A static avatar is an image named by <InlineCode>alt</InlineCode>, or hidden with{' '}
              <InlineCode>decorative</InlineCode> when the name is written next to it. The types
              require one of the two.
            </li>
            <li>
              Presence and the badge&apos;s <InlineCode>badgeLabel</InlineCode> join the name
              (&quot;Sam, online, verified&quot;); pass <InlineCode>labels</InlineCode> to translate
              them.
            </li>
            <li>
              With <InlineCode>href</InlineCode> or <InlineCode>onPress</InlineCode> it is a link or
              button with a state layer, a focus ring and a 48px touch target.
            </li>
            <li>
              <InlineCode>AvatarGroup</InlineCode> is read once by its{' '}
              <InlineCode>label</InlineCode>; its static avatars become decorative.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming" className="text-headline-small text-on-surface">
            Theming
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>tone=&quot;auto&quot;</InlineCode> hashes the name into one of 12 colour
              slots, so a name keeps its colour. By default the slots cycle through the primary,
              secondary, tertiary and neutral containers, so they follow every theme, mode and
              contrast level. Give an app more colours by setting{' '}
              <InlineCode>--wm-avatar-tone-1</InlineCode> …{' '}
              <InlineCode>--wm-avatar-tone-12</InlineCode> and their{' '}
              <InlineCode>--wm-avatar-on-tone-*</InlineCode> text colours (any colour: a theme
              variable, hex, <InlineCode>oklch()</InlineCode>).
            </li>
            <li>
              Status colours default to M3 roles (online <InlineCode>primary</InlineCode>, away{' '}
              <InlineCode>tertiary</InlineCode>, offline an <InlineCode>outline</InlineCode> ring,
              badge <InlineCode>primary</InlineCode>). Override them with{' '}
              <InlineCode>--wm-avatar-online</InlineCode>, <InlineCode>--wm-avatar-away</InlineCode>
              , <InlineCode>--wm-avatar-offline</InlineCode>,{' '}
              <InlineCode>--wm-avatar-badge</InlineCode> and{' '}
              <InlineCode>--wm-avatar-on-badge</InlineCode>.
            </li>
            <li>
              Set the variables on <InlineCode>:root</InlineCode>, a section or one avatar, in CSS
              or with Tailwind (<InlineCode>[--wm-avatar-tone-1:#16a34a]</InlineCode>). Tailwind
              classes on the parts win too:{' '}
              <InlineCode>
                classNames=&#123;&#123; visual: &apos;bg-green-600 text-white&apos; &#125;&#125;
              </InlineCode>
              .
            </li>
            <li>
              Rounded squares take a corner from the shape scale for their size; Expressive shapes
              are masks, so they scale with the avatar.
            </li>
            <li>
              Initials are whole graphemes in the locale&apos;s casing, so accented letters stay
              with their letters (&quot;Élodie Dubois&quot; → &quot;ÉD&quot;).
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
