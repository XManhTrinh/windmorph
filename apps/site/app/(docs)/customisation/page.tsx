import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';

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
        <h2 className="text-headline-small text-on-surface">The override ladder</h2>
        <ol className="list-decimal ps-6 text-body-large text-on-surface-variant">
          <li>
            <span className="text-on-surface">Tokens via CSS</span> — set{' '}
            <code className="text-on-surface">--md-sys-*</code> globally on{' '}
            <code className="text-on-surface">:root</code> or per theme on{' '}
            <code className="text-on-surface">[data-theme=&quot;ocean&quot;]</code>.
          </li>
          <li>
            <span className="text-on-surface">Brand theme</span> — generate one with{' '}
            <code className="text-on-surface">createTheme()</code> or the CLI.
          </li>
          <li>
            <span className="text-on-surface">Restrict the picker</span> —{' '}
            <code className="text-on-surface">
              &lt;ThemeProvider themes={'{'}['baseline', 'ocean', 'acme']{'}'}&gt;
            </code>
            .
          </li>
          <li>
            <span className="text-on-surface">Scope a subtree</span> —{' '}
            <code className="text-on-surface">
              &lt;ThemeScope theme=&quot;forest&quot; mode=&quot;dark&quot;&gt;
            </code>
            .
          </li>
          <li>
            <span className="text-on-surface">Component level</span> —{' '}
            <code className="text-on-surface">className</code> /{' '}
            <code className="text-on-surface">
              classNames={'{'}
              {'{'} root, label, icon {'}'}
              {'}'}
            </code>
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
        <h2 className="text-headline-small text-on-surface">className &amp; classNames</h2>
        <p className="text-body-large text-on-surface-variant">
          Every component takes <code className="text-on-surface">className</code> for the root and{' '}
          <code className="text-on-surface">classNames</code> for its named slots (for example a
          button’s <code className="text-on-surface">root</code>,{' '}
          <code className="text-on-surface">content</code>,{' '}
          <code className="text-on-surface">label</code> and{' '}
          <code className="text-on-surface">icon</code>). The consumer’s class always wins.
        </p>
        <CodeBlock code={CLASSNAME_SNIPPET} html={classNameHtml} lang="tsx" title="overrides.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Extending variants</h2>
        <p className="text-body-large text-on-surface-variant">
          Each component exports its variant recipe as a{' '}
          <code className="text-on-surface">*Styles</code> definition —{' '}
          <code className="text-on-surface">buttonStyles</code>,{' '}
          <code className="text-on-surface">iconButtonStyles</code>,{' '}
          <code className="text-on-surface">cardStyles</code>,{' '}
          <code className="text-on-surface">chipStyles</code>,{' '}
          <code className="text-on-surface">textFieldStyles</code>,{' '}
          <code className="text-on-surface">menuStyles</code> and many more. Compose a new variant
          on top of one with <code className="text-on-surface">tv</code> (a pre-configured{' '}
          <code className="text-on-surface">tailwind-variants</code> re-export) and{' '}
          <code className="text-on-surface">VariantProps</code>.
        </p>
        <CodeBlock code={TV_SNIPPET} html={tvHtml} lang="tsx" title="brand-button.ts" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Why the consumer wins: cn()</h2>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">cn()</code> is{' '}
          <code className="text-on-surface">tailwind-merge</code> extended with the library’s theme
          keys — colour roles, type roles, <code className="text-on-surface">corner-*</code> radii,{' '}
          <code className="text-on-surface">elevation-*</code> shadows and{' '}
          <code className="text-on-surface">m3-*</code> easings. Later classes override earlier
          conflicting ones, which is why a <code className="text-on-surface">className</code> you
          pass always beats the library’s own class for that property.
        </p>
        <CodeBlock code={CN_SNIPPET} html={cnHtml} lang="ts" title="cn" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Layout safety</h2>
        <p className="text-body-large text-on-surface-variant">
          A component’s internals never depend on the root’s{' '}
          <code className="text-on-surface">position</code>,{' '}
          <code className="text-on-surface">overflow</code>,{' '}
          <code className="text-on-surface">display</code> or{' '}
          <code className="text-on-surface">transform</code>, so you can put any layout class on any
          component and it looks and behaves the same.
        </p>
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>
            <code className="text-on-surface">className</code> and{' '}
            <code className="text-on-surface">style</code> always land on the outermost element;{' '}
            <code className="text-on-surface">style</code> is merged, never replaced.
          </li>
          <li>
            State layer and ripple are painted as background layers, so they follow{' '}
            <code className="text-on-surface">border-radius</code> and need neither{' '}
            <code className="text-on-surface">relative</code> nor{' '}
            <code className="text-on-surface">overflow-hidden</code>.
          </li>
          <li>
            Motion never animates the root’s <code className="text-on-surface">transform</code>, and
            containers never set <code className="text-on-surface">transform</code>/
            <code className="text-on-surface">filter</code>/
            <code className="text-on-surface">contain</code>/
            <code className="text-on-surface">will-change</code> on their root, so{' '}
            <code className="text-on-surface">fixed</code> children are never trapped.
          </li>
          <li>
            The focus ring is a CSS <code className="text-on-surface">outline</code>, so clipping or{' '}
            <code className="text-on-surface">fixed</code> ancestors can’t hide it.
          </li>
        </ul>
        <CodeBlock code={LAYOUT_SNIPPET} html={layoutHtml} lang="tsx" title="layout.tsx" />
        <p className="text-body-large text-on-surface-variant">
          Two documented exceptions: overlays portal to{' '}
          <code className="text-on-surface">body</code> on a z-index token scale (
          <code className="text-on-surface">--md-sys-z-*</code>, which you can override), and
          scroll-driven app bars and toolbars manage their own expansion (
          <code className="text-on-surface">useToolbarScrollExpansion</code>,{' '}
          <code className="text-on-surface">TopAppBarScrollBehavior</code>).
        </p>
      </section>
    </article>
  );
}
