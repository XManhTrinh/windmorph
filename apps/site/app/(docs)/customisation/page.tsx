import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';
import { InlineCode } from '../../../components/inline-code';

export const metadata: Metadata = guideMetadata('/customisation');

const CLASSNAME_SNIPPET = `import { Button } from '@windmorph/react';

// A consumer className always wins over the library's conflicting class (via cn()).
<Button variant="filled" className="rounded-corner-full px-8">Rounded</Button>;

// Per-slot overrides with classNames.
<Button classNames={{ root: 'shadow-none', label: 'tracking-wide', icon: 'text-primary' }}>
  Save
</Button>;`;

const TV_SNIPPET = `import { tv, buttonStyles } from '@windmorph/react';
import type { VariantProps } from '@windmorph/react';

// Extend an exported *Styles recipe with a new variant using tv (tailwind-variants,
// pre-configured with the M3 twMergeConfig).
const brandButton = tv({
  extend: buttonStyles,
  variants: {
    tone: { brand: 'bg-tertiary text-on-tertiary', muted: 'bg-surface-container' },
  },
  defaultVariants: { tone: 'brand' },
});

type BrandButtonProps = VariantProps<typeof brandButton>;`;

const CN_SNIPPET = `import { cn } from '@windmorph/react';

// cn is tailwind-merge extended with the M3 theme keys (colour roles, type roles,
// corner-* radii, elevation-* shadows, m3-* easings). Later classes win, so a
// consumer class always overrides a conflicting library class.
cn('bg-primary', 'bg-secondary'); // -> 'bg-secondary'
cn('rounded-corner-small', 'rounded-corner-large'); // -> 'rounded-corner-large'`;

const LAYOUT_SNIPPET = `import { Button, DockedToolbar } from '@windmorph/react';

// className / style land on the outermost element, so any layout class is safe:
<Button className="fixed bottom-4 right-4">New</Button>;
<DockedToolbar aria-label="Actions" className="fixed inset-x-0 bottom-0 w-full" />;`;

export default async function CustomisationPage() {
  const [classNameHtml, tvHtml, cnHtml, layoutHtml] = await Promise.all([
    highlightSource(CLASSNAME_SNIPPET, 'tsx'),
    highlightSource(TV_SNIPPET, 'tsx'),
    highlightSource(CN_SNIPPET, 'ts'),
    highlightSource(LAYOUT_SNIPPET, 'tsx'),
  ]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Customisation</h1>
        <p className="text-body-large text-on-surface-variant">
          Customise from broad to narrow: redefine tokens, generate a brand theme, restrict the
          picker, scope a subtree, or override an individual component. Each step is more local than
          the last.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 id="the-override-ladder" className="text-headline-small text-on-surface">
          The override ladder
        </h2>
        <ol className="list-decimal ps-6 text-body-large text-on-surface-variant">
          <li>
            <span className="text-on-surface">Tokens via CSS</span> — set{' '}
            <InlineCode>--md-sys-*</InlineCode> globally on <InlineCode>:root</InlineCode> or per
            theme on <InlineCode>[data-theme=&quot;ocean&quot;]</InlineCode>.
          </li>
          <li>
            <span className="text-on-surface">Brand theme</span> — generate one with{' '}
            <InlineCode>createTheme()</InlineCode> or the CLI.
          </li>
          <li>
            <span className="text-on-surface">Restrict the picker</span> —{' '}
            <InlineCode>
              &lt;ThemeProvider themes={'{'}['baseline', 'ocean', 'acme']{'}'}&gt;
            </InlineCode>
            .
          </li>
          <li>
            <span className="text-on-surface">Scope a subtree</span> —{' '}
            <InlineCode>
              &lt;ThemeScope theme=&quot;forest&quot; mode=&quot;dark&quot;&gt;
            </InlineCode>
            .
          </li>
          <li>
            <span className="text-on-surface">Component level</span> —{' '}
            <InlineCode>className</InlineCode> /{' '}
            <InlineCode>
              classNames={'{'}
              {'{'} root, label, icon {'}'}
              {'}'}
            </InlineCode>
            , or extend the exported variant definitions.
          </li>
        </ol>
        <p className="text-body-large text-on-surface-variant">
          Steps 1–4 are covered in the{' '}
          <a className="text-primary underline" href="/theming">
            Theming guide
          </a>
          . This page focuses on step 5.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="classname-and-classnames" className="text-headline-small text-on-surface">
          className &amp; classNames
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Every component takes <InlineCode>className</InlineCode> for the root and{' '}
          <InlineCode>classNames</InlineCode> for its named slots (for example a button’s{' '}
          <InlineCode>root</InlineCode>, <InlineCode>content</InlineCode>,{' '}
          <InlineCode>label</InlineCode> and <InlineCode>icon</InlineCode>). The consumer’s class
          always wins.
        </p>
        <CodeBlock code={CLASSNAME_SNIPPET} html={classNameHtml} lang="tsx" title="overrides.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="extending-variants" className="text-headline-small text-on-surface">
          Extending variants
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Each component exports its variant recipe as a <InlineCode>*Styles</InlineCode> definition
          — <InlineCode>buttonStyles</InlineCode>, <InlineCode>iconButtonStyles</InlineCode>,{' '}
          <InlineCode>cardStyles</InlineCode>, <InlineCode>chipStyles</InlineCode>,{' '}
          <InlineCode>textFieldStyles</InlineCode>, <InlineCode>menuStyles</InlineCode> and many
          more. Compose a new variant on top of one with <InlineCode>tv</InlineCode> (a
          pre-configured <InlineCode>tailwind-variants</InlineCode> re-export) and{' '}
          <InlineCode>VariantProps</InlineCode>.
        </p>
        <CodeBlock code={TV_SNIPPET} html={tvHtml} lang="tsx" title="brand-button.ts" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="why-the-consumer-wins-cn" className="text-headline-small text-on-surface">
          Why the consumer wins: cn()
        </h2>
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>cn()</InlineCode> is <InlineCode>tailwind-merge</InlineCode> extended with the
          library’s theme keys — colour roles, type roles, <InlineCode>corner-*</InlineCode> radii,{' '}
          <InlineCode>elevation-*</InlineCode> shadows and <InlineCode>m3-*</InlineCode> easings.
          Later classes override earlier conflicting ones, which is why a{' '}
          <InlineCode>className</InlineCode> you pass always beats the library’s own class for that
          property.
        </p>
        <CodeBlock code={CN_SNIPPET} html={cnHtml} lang="ts" title="cn" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="layout-safety" className="text-headline-small text-on-surface">
          Layout safety
        </h2>
        <p className="text-body-large text-on-surface-variant">
          A component’s internals never depend on the root’s <InlineCode>position</InlineCode>,{' '}
          <InlineCode>overflow</InlineCode>, <InlineCode>display</InlineCode> or{' '}
          <InlineCode>transform</InlineCode>, so you can put any layout class on any component and
          it looks and behaves the same.
        </p>
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>
            <InlineCode>className</InlineCode> and <InlineCode>style</InlineCode> always land on the
            outermost element; <InlineCode>style</InlineCode> is merged, never replaced.
          </li>
          <li>
            State layer and ripple are painted as background layers, so they follow{' '}
            <InlineCode>border-radius</InlineCode> and need neither{' '}
            <InlineCode>relative</InlineCode> nor <InlineCode>overflow-hidden</InlineCode>.
          </li>
          <li>
            Motion never animates the root’s <InlineCode>transform</InlineCode>, and containers
            never set <InlineCode>transform</InlineCode>/<InlineCode>filter</InlineCode>/
            <InlineCode>contain</InlineCode>/<InlineCode>will-change</InlineCode> on their root, so{' '}
            <InlineCode>fixed</InlineCode> children are never trapped.
          </li>
          <li>
            The focus ring is a CSS <InlineCode>outline</InlineCode>, so clipping or{' '}
            <InlineCode>fixed</InlineCode> ancestors can’t hide it.
          </li>
        </ul>
        <CodeBlock code={LAYOUT_SNIPPET} html={layoutHtml} lang="tsx" title="layout.tsx" />
        <p className="text-body-large text-on-surface-variant">
          Three documented exceptions: overlays portal to <InlineCode>body</InlineCode> on a z-index
          token scale (<InlineCode>--md-sys-z-*</InlineCode>, which you can override); scroll-driven
          app bars and toolbars manage their own expansion (
          <InlineCode>useToolbarScrollExpansion</InlineCode>,{' '}
          <InlineCode>TopAppBarScrollBehavior</InlineCode>); and a FAB or toolbar that you hide (
          <InlineCode>visible={'{false}'}</InlineCode>) scales or slides with a{' '}
          <InlineCode>transform</InlineCode> on its root while hidden. That uses the{' '}
          <InlineCode>transform</InlineCode> property only, so Tailwind&apos;s{' '}
          <InlineCode>translate-*</InlineCode> and <InlineCode>scale-*</InlineCode> classes still
          apply.
        </p>
      </section>
    </article>
  );
}
