import type { ComponentDoc } from './doc';
import { avatarTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const AvatarBadges = lazyExample('avatar/avatar-badges', 'AvatarBadges');
const AvatarFallbacks = lazyExample('avatar/avatar-fallbacks', 'AvatarFallbacks');
const AvatarGroupExample = lazyExample('avatar/avatar-group', 'AvatarGroupExample');
const AvatarGroupLinks = lazyExample('avatar/avatar-group-links', 'AvatarGroupLinks');
const AvatarLive = lazyExample('avatar/avatar-live', 'AvatarLive');
const AvatarPhotos = lazyExample('avatar/avatar-photos', 'AvatarPhotos');
const AvatarShapes = lazyExample('avatar/avatar-shapes', 'AvatarShapes');
const AvatarStatusRing = lazyExample('avatar/avatar-status-ring', 'AvatarStatusRing');
const AvatarStories = lazyExample('avatar/avatar-stories', 'AvatarStories');
const AvatarColors = lazyExample('avatar/avatar-colors', 'AvatarColors');

/** Avatar page body: purpose, examples and theming. */
export async function AvatarBody(): Promise<ComponentDoc> {
  const [fallbacks, photos, colors, shapes, badges, statusRing, stories, live, group, groupLinks] =
    await Promise.all([
      readExampleSource('avatar/avatar-fallbacks.tsx'),
      readExampleSource('avatar/avatar-photos.tsx'),
      readExampleSource('avatar/avatar-colors.tsx'),
      readExampleSource('avatar/avatar-shapes.tsx'),
      readExampleSource('avatar/avatar-badges.tsx'),
      readExampleSource('avatar/avatar-status-ring.tsx'),
      readExampleSource('avatar/avatar-stories.tsx'),
      readExampleSource('avatar/avatar-live.tsx'),
      readExampleSource('avatar/avatar-group.tsx'),
      readExampleSource('avatar/avatar-group-links.tsx'),
    ]);
  const [
    fallbacksHtml,
    photosHtml,
    colorsHtml,
    shapesHtml,
    badgesHtml,
    statusRingHtml,
    storiesHtml,
    liveHtml,
    groupHtml,
    groupLinksHtml,
  ] = await Promise.all([
    highlightSource(fallbacks),
    highlightSource(photos),
    highlightSource(colors),
    highlightSource(shapes),
    highlightSource(badges),
    highlightSource(statusRing),
    highlightSource(stories),
    highlightSource(live),
    highlightSource(group),
    highlightSource(groupLinks),
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
          <ExampleViewer
            title="Colours"
            code={colors}
            html={colorsHtml}
            fileName="avatar-colors.tsx"
          >
            <AvatarColors />
          </ExampleViewer>
          <ExampleViewer
            title="Circle, rounded and the 35 Expressive shapes"
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
          <ExampleViewer
            title="A status ring and its segments"
            code={statusRing}
            html={statusRingHtml}
            fileName="avatar-status-ring.tsx"
          >
            <AvatarStatusRing />
          </ExampleViewer>
          <ExampleViewer
            title="Stories: a gradient ring"
            code={stories}
            html={storiesHtml}
            fileName="avatar-stories.tsx"
          >
            <AvatarStories />
          </ExampleViewer>
          <ExampleViewer
            title="Live now: a ring and a pill at the bottom"
            code={live}
            html={liveHtml}
            fileName="avatar-live.tsx"
          >
            <AvatarLive />
          </ExampleViewer>
          <ExampleViewer title="Groups" code={group} html={groupHtml} fileName="avatar-group.tsx">
            <AvatarGroupExample />
          </ExampleViewer>
          <ExampleViewer
            title="A group of links in an app's own component"
            code={groupLinks}
            html={groupLinksHtml}
            fileName="avatar-group-links.tsx"
          >
            <AvatarGroupLinks />
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
            Its sizes are in px (24 to 96px), so it keeps its M3 slot size at larger text sizes.
            With <InlineCode>href</InlineCode> it is a link and with{' '}
            <InlineCode>onPress</InlineCode> a button, with the core&apos;s state layer (hover,
            focus and the pressed ripple) painted over the photo too.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>AvatarGroup</InlineCode> shows several as one unit, named once by{' '}
            <InlineCode>aria-label</InlineCode> (or <InlineCode>aria-labelledby</InlineCode>); a
            linked or pressable &quot;+N&quot; is named by <InlineCode>labels.overflow</InlineCode>.
            Each child sits in an item of the group&apos;s and reads the group&apos;s size through
            context, so an app&apos;s own component around an Avatar works. When two or more avatars
            are links or buttons, the group spaces itself so their 48px touch targets never overlap.
          </p>
          <p className="text-body-large text-on-surface-variant">
            It renders on the server (a client component, since it reads the group&apos;s context).
            The photo sits over the fallback, so it shows as soon as it loads, with or without JS;
            if it fails, the fallback shows. Pass <InlineCode>image</InlineCode> to use your
            framework&apos;s image component, such as <InlineCode>next/image</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>shape</InlineCode> is <InlineCode>circle</InlineCode> by default, or{' '}
            <InlineCode>rounded</InlineCode> (a shape-scale corner for its size), or a shape
            outline: one of the 35 M3 Expressive shapes as a constant (
            <InlineCode>{'shape={cookie12SidedShape}'}</InlineCode> from{' '}
            <InlineCode>@windmorph/react/primitives</InlineCode>) or your own{' '}
            <InlineCode>MaterialShapePath</InlineCode>. On a shape, the presence dot and the badge
            sit on the outline, and a group&apos;s ring follows the shape.{' '}
            <InlineCode>icon</InlineCode> sets the fallback when there is no name.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>statusRing</InlineCode> draws a ring a small gap away from the avatar, for a
            status an app shows on the avatar itself: <InlineCode>active</InlineCode> when there is
            something to see (something new from the account, a broadcast under way, the person
            speaking) and <InlineCode>inactive</InlineCode>, thinner and quieter, when there is
            nothing new. <InlineCode>statusRingLabel</InlineCode>, required with it, says what the
            ring means in the accessible name. The ring is drawn outside the avatar&apos;s box, so
            the avatar keeps its size and nothing moves when a ring appears or goes: leave 4px round
            it (5px from <InlineCode>lg</InlineCode>). <InlineCode>statusRingSegments</InlineCode>{' '}
            cuts it into segments, one for each thing to see, and{' '}
            <InlineCode>statusRingInactiveSegments</InlineCode> marks the ones already seen, from
            the top going clockwise.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>badgePlacement=&quot;bottom&quot;</InlineCode> puts the badge on the
            avatar&apos;s bottom edge as a pill, for a short word such as &quot;LIVE&quot;: leave
            8px below the avatar for it (10px from <InlineCode>lg</InlineCode>). In an{' '}
            <InlineCode>AvatarGroup</InlineCode> an avatar with a ring is drawn above its
            neighbours&apos; photos and takes no more room; give a spaced group whose avatars have
            rings a wider gap.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Shapes and bundle size: circle and rounded avatars carry no shape data, and each outline
            costs only its own path, about 0.4 kB gzipped for Cookie12Sided and up to 2.5 kB for
            SoftBoom, the largest. <InlineCode>materialShapePaths</InlineCode> holds all 35 (about
            11 kB), for a shape picker. Shapes aren&apos;t mirrored in right-to-left layouts, as in
            Compose.
          </p>
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
              <InlineCode>color=&quot;auto&quot;</InlineCode> hashes the name into one of 12 colour
              slots, so a name keeps its colour. By default the slots cycle through the primary,
              secondary, tertiary and neutral containers, so they follow every theme, mode and
              contrast level. Give an app more colours by setting{' '}
              <InlineCode>--wm-avatar-color-1</InlineCode> …{' '}
              <InlineCode>--wm-avatar-color-12</InlineCode> and their{' '}
              <InlineCode>--wm-avatar-on-color-*</InlineCode> text colours (any colour: a theme
              variable, hex, <InlineCode>oklch()</InlineCode>). <InlineCode>data-color</InlineCode>{' '}
              is the <InlineCode>color</InlineCode> prop as given (<InlineCode>auto</InlineCode> by
              default); with <InlineCode>auto</InlineCode>, <InlineCode>data-color-slot</InlineCode>{' '}
              holds the slot (1–12) the name hashed into.
            </li>
            <li>
              Status colours default to M3 roles (online <InlineCode>success</InlineCode>, away{' '}
              <InlineCode>warning</InlineCode>, offline an <InlineCode>outline</InlineCode> ring,
              badge <InlineCode>primary</InlineCode>), all in the token set below.
            </li>
            <li>
              The status ring is painted with{' '}
              <InlineCode>--wm-avatar-status-ring-active</InlineCode> (
              <InlineCode>primary</InlineCode>) and{' '}
              <InlineCode>--wm-avatar-status-ring-inactive</InlineCode> (
              <InlineCode>outline</InlineCode>), which take a colour or a gradient; its width, its
              gap from the avatar and the gap between segments (an angle, with its unit) are tokens
              too. Paint it through the tokens: <InlineCode>classNames.statusRing</InlineCode>{' '}
              reaches every layer of the ring. In forced colours it is{' '}
              <InlineCode>Highlight</InlineCode> when active and <InlineCode>GrayText</InlineCode>{' '}
              when inactive.
            </li>
            <li>
              Set the tokens on <InlineCode>:root</InlineCode>, a section or one avatar, in CSS or
              with Tailwind (<InlineCode>[--wm-avatar-color-1:#16a34a]</InlineCode>); the root
              carries <InlineCode>data-tokens=&quot;wm-avatar&quot;</InlineCode>. Tailwind classes
              on the parts win too:{' '}
              <InlineCode>
                classNames=&#123;&#123; visual: &apos;bg-green-600 text-white&apos; &#125;&#125;
              </InlineCode>
              , and <InlineCode>classNames.stateLayer</InlineCode> styles the state layer of a link
              or button avatar.
            </li>
            <li>
              In forced colours an Expressive shape becomes a circle, and the shape and the badge
              keep a <InlineCode>CanvasText</InlineCode> edge; presence keeps its meaning: online{' '}
              <InlineCode>CanvasText</InlineCode>, away <InlineCode>GrayText</InlineCode>, offline a
              ring.
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
          <TokenTable set={avatarTokenSet} caption="Avatar tokens" />
        </section>
      </>
    ),
  };
}
