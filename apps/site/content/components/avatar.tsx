import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const AvatarBadges = lazyExample('avatar/avatar-badges', 'AvatarBadges');
const AvatarFallbacks = lazyExample('avatar/avatar-fallbacks', 'AvatarFallbacks');
const AvatarGroupExample = lazyExample('avatar/avatar-group', 'AvatarGroupExample');
const AvatarPhotos = lazyExample('avatar/avatar-photos', 'AvatarPhotos');
const AvatarShapes = lazyExample('avatar/avatar-shapes', 'AvatarShapes');
const AvatarTones = lazyExample('avatar/avatar-tones', 'AvatarTones');

/** Avatar page body: purpose, examples and theming. */
export async function AvatarBody(): Promise<ComponentDoc> {
  const [fallbacks, photos, tones, shapes, badges, group] = await Promise.all([
    readExampleSource('avatar/avatar-fallbacks.tsx'),
    readExampleSource('avatar/avatar-photos.tsx'),
    readExampleSource('avatar/avatar-tones.tsx'),
    readExampleSource('avatar/avatar-shapes.tsx'),
    readExampleSource('avatar/avatar-badges.tsx'),
    readExampleSource('avatar/avatar-group.tsx'),
  ]);
  const [fallbacksHtml, photosHtml, tonesHtml, shapesHtml, badgesHtml, groupHtml] =
    await Promise.all([
      highlightSource(fallbacks),
      highlightSource(photos),
      highlightSource(tones),
      highlightSource(shapes),
      highlightSource(badges),
      highlightSource(group),
    ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Fallbacks and sizes"
            code={fallbacks}
            html={fallbacksHtml}
            fileName="avatar-fallbacks.tsx"
          >
            <AvatarFallbacks />
          </ExampleViewer>
          <ExampleViewer
            title="Photos and links"
            code={photos}
            html={photosHtml}
            fileName="avatar-photos.tsx"
          >
            <AvatarPhotos />
          </ExampleViewer>
          <ExampleViewer title="Tones" code={tones} html={tonesHtml} fileName="avatar-tones.tsx">
            <AvatarTones />
          </ExampleViewer>
          <ExampleViewer
            title="All 35 Expressive shapes"
            code={shapes}
            html={shapesHtml}
            fileName="avatar-shapes.tsx"
          >
            <AvatarShapes />
          </ExampleViewer>
          <ExampleViewer
            title="Presence and badges"
            code={badges}
            html={badgesHtml}
            fileName="avatar-badges.tsx"
          >
            <AvatarBadges />
          </ExampleViewer>
          <ExampleViewer title="Groups" code={group} html={groupHtml} fileName="avatar-group.tsx">
            <AvatarGroupExample />
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
