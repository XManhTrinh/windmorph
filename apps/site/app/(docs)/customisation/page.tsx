import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';
import { InlineCode } from '../../../components/inline-code';

export const metadata: Metadata = guideMetadata('/customisation');

const TOKENS_SNIPPET = `/* Every filled card, in every theme. Declared on :root and [data-theme],
   a role value resolves again in each theme, mode, contrast and ThemeScope. */
:root,
[data-theme] {
  --md-comp-filled-card-container-color: var(--md-sys-color-secondary-container);
}

/* Squarer elevated cards in one part of the page. */
.compact {
  --md-comp-elevated-card-container-shape: 4px;
}`;

const TOKENS_SCOPE_SNIPPET = `import { Card, ThemeScope } from '@windmorph/react';

// A ThemeScope's class also goes on the overlays opened inside it
// (menus, dialogs, tooltips), so tokens set through it reach them.
<ThemeScope className="compact">
  <Card variant="elevated">…</Card>
</ThemeScope>;

// One instance: set the variable on the component itself.
<Card className="[--md-comp-filled-card-container-color:var(--md-sys-color-tertiary-container)]">
  …
</Card>;`;

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
// corner-* radii, elevation-* shadows, m3-* easings and durations). Later classes win,
// so a consumer class always overrides a conflicting library class.
cn('bg-primary', 'bg-secondary'); // -> 'bg-secondary'
cn('rounded-corner-small', 'rounded-corner-large'); // -> 'rounded-corner-large'`;

const LAYOUT_SNIPPET = `import { Button, DockedToolbar } from '@windmorph/react';

// className / style land on the outermost element, so any layout class is safe:
<Button className="fixed bottom-4 right-4">New</Button>;
<DockedToolbar aria-label="Actions" className="fixed inset-x-0 bottom-0 w-full">
  …
</DockedToolbar>;`;

export default async function CustomisationPage() {
  const [tokensHtml, tokensScopeHtml, classNameHtml, tvHtml, cnHtml, layoutHtml] =
    await Promise.all([
      highlightSource(TOKENS_SNIPPET, 'css'),
      highlightSource(TOKENS_SCOPE_SNIPPET, 'tsx'),
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
            <InlineCode>--md-sys-*</InlineCode> tokens on <InlineCode>:root</InlineCode> for every
            theme, or on <InlineCode>[data-theme=&quot;ocean&quot;]</InlineCode> for one.
          </li>
          <li>
            <span className="text-on-surface">Component tokens</span> — set M3&apos;s{' '}
            <InlineCode>--md-comp-*</InlineCode> variables to restyle every instance of a component,
            globally or within a scope.
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
          Steps 1 and 3–5 are covered in the{' '}
          <a className="text-primary underline" href="/theming">
            Theming guide
          </a>
          . This page covers component tokens (step 2) and the component level (step 6).
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="component-tokens" className="text-headline-small text-on-surface">
          Component tokens
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Components with tokens read M3&apos;s component tokens as CSS variables, named after
          M3&apos;s own <InlineCode>md.comp.*</InlineCode> tokens with the dots as dashes:{' '}
          <InlineCode>md.comp.filled-card.container.color</InlineCode> is{' '}
          <InlineCode>--md-comp-filled-card-container-color</InlineCode>. Each is unset until you
          set it, and falls back to the system token the component uses by default. A
          component&apos;s API tab lists its tokens, their defaults and what they paint (Card&apos;s{' '}
          <a className="text-primary underline" href="/components/card/api#tokens">
            Tokens
          </a>
          ).
        </p>
        <CodeBlock code={TOKENS_SNIPPET} html={tokensHtml} lang="css" title="tokens.css" />
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>
            <span className="text-on-surface">Declare role values on</span>{' '}
            <InlineCode>:root, [data-theme]</InlineCode>. A value that reads another variable
            resolves where it&apos;s declared: on <InlineCode>:root</InlineCode> alone,{' '}
            <InlineCode>var(--md-sys-color-secondary-container)</InlineCode> would keep the root
            theme&apos;s colour inside a dark or differently themed{' '}
            <InlineCode>ThemeScope</InlineCode>. ThemeScopes and overlays carry{' '}
            <InlineCode>data-theme</InlineCode>, so the value resolves again in each.
          </li>
          <li>
            <span className="text-on-surface">A literal value</span> (
            <InlineCode>#0050c8</InlineCode>, <InlineCode>4px</InlineCode>) is the same in every
            theme, mode and contrast level. Check a literal colour&apos;s contrast yourself.
          </li>
          <li>
            <span className="text-on-surface">Set them on the component or an ancestor</span>, never
            on an inner slot: the component resolves its tokens on its root.
          </li>
          <li>
            <span className="text-on-surface">Icon colour in a container:</span>{' '}
            <InlineCode>--md-comp-icon-button-icon-color</InlineCode> (M3&apos;s baseline name)
            colours every standard and outlined icon button inside the element that sets it; the
            per-variant <InlineCode>--md-comp-icon-button-standard-icon-color</InlineCode> and{' '}
            <InlineCode>--md-comp-icon-button-outlined-icon-color</InlineCode> come first. App bars,
            search bars and vibrant toolbars set it to <InlineCode>currentColor</InlineCode>, so
            their icons follow their own text colour.
          </li>
          <li>
            <span className="text-on-surface">Overlays</span> portal to{' '}
            <InlineCode>body</InlineCode>, so tokens set on an arbitrary ancestor don&apos;t reach
            them. Tokens on <InlineCode>:root</InlineCode>, on <InlineCode>[data-theme]</InlineCode>
            , on the overlay&apos;s own <InlineCode>className</InlineCode>, or through the class of
            a <InlineCode>ThemeScope</InlineCode> around it do.
          </li>
          <li>
            <span className="text-on-surface">Precedence:</span> system token, then component token,
            then <InlineCode>className</InlineCode> and <InlineCode>classNames</InlineCode>, which
            still win.
          </li>
          <li>
            <span className="text-on-surface">Styling hooks:</span> a component with tokens marks
            its root with the props its tokens depend on: <InlineCode>data-variant</InlineCode>,{' '}
            <InlineCode>data-size</InlineCode> where it has sizes, and a few others such as the
            FAB&apos;s <InlineCode>data-color</InlineCode>. They&apos;re public, so your own
            selectors can use them (<InlineCode>[data-variant=&quot;outlined&quot;]</InlineCode>
            ).
          </li>
        </ul>
        <CodeBlock
          code={TOKENS_SCOPE_SNIPPET}
          html={tokensScopeHtml}
          lang="tsx"
          title="scoped-tokens.tsx"
        />
        <h3 id="coming-from-material-web" className="text-title-large text-on-surface">
          Coming from Material Web
        </h3>
        <p className="text-body-large text-on-surface-variant">
          Material Web names the same tokens without <InlineCode>comp-</InlineCode>: its{' '}
          <InlineCode>--md-outlined-card-outline-color</InlineCode> is Windmorph&apos;s{' '}
          <InlineCode>--md-comp-outlined-card-outline-color</InlineCode>, and{' '}
          <InlineCode>--md-icon-button-icon-color</InlineCode> is{' '}
          <InlineCode>--md-comp-icon-button-icon-color</InlineCode>. Windmorph follows M3&apos;s
          current token tables, which are newer than Material Web, so:
        </p>
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>
            Where M3 Expressive renamed a component&apos;s tokens, Windmorph uses the new name. The
            component&apos;s Tokens table is the reference.
          </li>
          <li>
            Expressive sizes have their own shapes, so a single{' '}
            <InlineCode>container-shape</InlineCode> becomes one per size where M3 has sizes.
          </li>
          <li>
            Expressive-only tokens, such as a toggle button&apos;s{' '}
            <InlineCode>selected-*</InlineCode> and <InlineCode>unselected-*</InlineCode> colours,
            have no Material Web equivalent.
          </li>
          <li>
            Typography, state-layer, disabled and spacing tokens aren&apos;t exposed. Use{' '}
            <InlineCode>--md-sys-typescale-*</InlineCode>, <InlineCode>className</InlineCode> or{' '}
            <InlineCode>classNames</InlineCode>, and the <InlineCode>size</InlineCode> prop.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="classname-and-classnames" className="text-headline-small text-on-surface">
          className &amp; classNames
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Every component takes <InlineCode>className</InlineCode> for its outermost element and{' '}
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
          <InlineCode>elevation-*</InlineCode> shadows, and <InlineCode>m3-*</InlineCode> easings
          and durations. Later classes override earlier conflicting ones, which is why a{' '}
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
            The focus ring is a CSS <InlineCode>outline</InlineCode>, so an{' '}
            <InlineCode>overflow-hidden</InlineCode> on the component itself can’t clip it. An
            ancestor that clips its overflow still can, so leave room around focusable items.
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
