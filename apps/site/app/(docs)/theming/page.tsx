import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { PalettesDemo } from '../../../examples/theming/palettes-demo';
import { ThemeSwitcherDemo } from '../../../examples/theming/theme-switcher-demo';
import { readExampleSource } from '../../../lib/example-source';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';

export const metadata: Metadata = guideMetadata('/theming');

const USE_THEME_SNIPPET = `import { useTheme } from '@windmorph/react';

function ThemeMenu() {
  const { theme, themes, setTheme, mode, setMode, resolvedMode } = useTheme();
  // theme / mode / contrast / motion plus resolvedMode (system -> light|dark)
  // and setters. Throws if used outside a ThemeProvider.
}`;

const PROVIDER_SNIPPET = `import { ThemeProvider } from '@windmorph/react';

<ThemeProvider
  defaultTheme="baseline"   // one of the six built-ins, or a createTheme() name
  defaultMode="system"      // light | dark | system
  defaultContrast="standard" // standard | medium | high
  defaultMotion="expressive" // expressive | standard
  storage="cookie"          // cookie (default) | local-storage | none
  storageKey="windmorph-theme"
>
  {children}
</ThemeProvider>;`;

const SCOPE_SNIPPET = `import { ThemeScope } from '@windmorph/react';

// Theme a subtree. Unset dimensions inherit from the nearest provider or scope; scopes nest.
<ThemeScope theme="forest" mode="dark">
  <PricingCard />
</ThemeScope>;`;

const CREATE_THEME_SNIPPET = `import { createTheme, ThemeProvider } from '@windmorph/react';

const acme = createTheme({ name: 'acme', seed: '#0B57D0' });
// variant defaults to 'tonal-spot'; contrast defaults to all three levels.

<ThemeProvider themes={['baseline', acme]} defaultTheme="acme">
  {children}
</ThemeProvider>;`;

const CLI_SNIPPET = `# Generate a static CSS theme (light, dark and system for each contrast level).
npx @windmorph/react theme --seed "#0B57D0" --name acme --out acme-theme.css

# Options: --variant tonal-spot|neutral|vibrant|expressive (default tonal-spot),
#          --palette <name>=<source> (repeatable, see Mixing palettes),
#          --custom success|warning=<hex>, --no-harmonize (see Success and warning),
#          --contrast standard,medium,high (default all), --out <file> (else stdout).`;

const PALETTES_SNIPPET = `import { createTheme } from '@windmorph/react';

// Vivid accents on calm, nearly neutral surfaces.
const blue = createTheme({
  name: 'blue',
  seed: '#1877F2',
  variant: 'vibrant',
  palettes: { neutral: 'tonal-spot', neutralVariant: 'tonal-spot' },
});

// A brand's own tertiary colour, from a hex.
const lotus = createTheme({
  name: 'lotus',
  seed: '#D63A7A',
  variant: 'vibrant',
  palettes: { tertiary: '#00A07A' },
});

// The CLI takes the same option:
// npx @windmorph/react theme --name blue --seed "#1877F2" --variant vibrant \\
//   --palette neutral=tonal-spot --palette neutral-variant=tonal-spot`;

const CUSTOM_COLORS_SNIPPET = `import { createTheme } from '@windmorph/react';

// Every theme has success and warning roles: a green and an amber, harmonised to the seed.
<span className="bg-success-container text-on-success-container">Paid</span>;
<span className="bg-warning-container text-on-warning-container">Payment pending</span>;

// A brand's own status colours, at their exact hues.
const shop = createTheme({
  name: 'shop',
  seed: '#0B57D0',
  customColors: { success: '#0B8043', warning: '#E37400' },
  harmonize: false,
});

// The CLI takes the same options:
// npx @windmorph/react theme --name shop --seed "#0B57D0" \\
//   --custom success=#0B8043 --custom warning=#E37400 --no-harmonize`;

/** The four roles of each custom colour, as live swatches in the current theme. */
const CUSTOM_SWATCHES = [
  ['success', 'bg-success text-on-success', 'bg-success-container text-on-success-container'],
  ['warning', 'bg-warning text-on-warning', 'bg-warning-container text-on-warning-container'],
] as const;

const TOKENS_SNIPPET = `/* Override tokens in CSS: globally on :root or per theme on [data-theme="…"]. */
:root {
  --md-sys-shape-corner-full: 12px;
  --md-ref-typeface-brand: 'Inter';
}
[data-theme='ocean'] {
  --md-sys-color-primary: #0050c8;
}`;

const SCRIPT_SNIPPET = `// Static / exported sites: ThemeScript applies the stored theme before first paint.
import { DEFAULT_THEME_STATE, ThemeScript } from '@windmorph/react';

<html lang="en" suppressHydrationWarning>
  <head>
    <ThemeScript defaults={DEFAULT_THEME_STATE} />
  </head>
  {/* ThemeScript is exported from @windmorph/react, not @windmorph/react/next. */}
</html>;`;

export default async function ThemingPage() {
  const demoSource = await readExampleSource('theming/theme-switcher-demo.tsx');
  const palettesDemoSource = await readExampleSource('theming/palettes-demo.tsx');
  const [
    demoHtml,
    useThemeHtml,
    providerHtml,
    scopeHtml,
    createThemeHtml,
    cliHtml,
    palettesHtml,
    customColorsHtml,
    palettesDemoHtml,
    tokensHtml,
    scriptHtml,
  ] = await Promise.all([
    highlightSource(demoSource, 'tsx'),
    highlightSource(USE_THEME_SNIPPET, 'tsx'),
    highlightSource(PROVIDER_SNIPPET, 'tsx'),
    highlightSource(SCOPE_SNIPPET, 'tsx'),
    highlightSource(CREATE_THEME_SNIPPET, 'tsx'),
    highlightSource(CLI_SNIPPET, 'bash'),
    highlightSource(PALETTES_SNIPPET, 'tsx'),
    highlightSource(CUSTOM_COLORS_SNIPPET, 'tsx'),
    highlightSource(palettesDemoSource, 'tsx'),
    highlightSource(TOKENS_SNIPPET, 'css'),
    highlightSource(SCRIPT_SNIPPET, 'tsx'),
  ]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Theming</h1>
        <p className="text-body-large text-on-surface-variant">
          Every colour, mode, contrast level and motion scheme is driven by semantic tokens. Pick
          one of six built-in themes, generate your own from a seed colour, and switch any of the
          four dimensions at runtime or per subtree.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Try it</h2>
        <p className="text-body-large text-on-surface-variant">
          This live demo drives a <code className="text-on-surface">ThemeScope</code> around the
          preview card, so the controls re-theme the card without touching the rest of the page.
        </p>
        <ThemeSwitcherDemo />
        <CodeBlock code={demoSource} html={demoHtml} lang="tsx" title="theme-switcher-demo.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">The four dimensions</h2>
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>
            <span className="text-on-surface">Theme</span> — six built-ins: baseline (the default,
            seed <code className="text-on-surface">#6750A4</code>), ocean (
            <code className="text-on-surface">#0061A4</code>), forest (
            <code className="text-on-surface">#386A20</code>), sunset (
            <code className="text-on-surface">#A04100</code>), rose (
            <code className="text-on-surface">#9C4146</code>) and slate (
            <code className="text-on-surface">#545F71</code>, the only{' '}
            <code className="text-on-surface">neutral</code> variant; the rest are{' '}
            <code className="text-on-surface">tonal-spot</code>). Scheme variants are{' '}
            <code className="text-on-surface">tonal-spot</code>,{' '}
            <code className="text-on-surface">neutral</code>,{' '}
            <code className="text-on-surface">vibrant</code> and{' '}
            <code className="text-on-surface">expressive</code>.
          </li>
          <li>
            <span className="text-on-surface">Mode</span> —{' '}
            <code className="text-on-surface">light</code>,{' '}
            <code className="text-on-surface">dark</code> or{' '}
            <code className="text-on-surface">system</code>.{' '}
            <code className="text-on-surface">system</code> follows{' '}
            <code className="text-on-surface">prefers-color-scheme</code> and resolves to{' '}
            <code className="text-on-surface">resolvedMode</code> on{' '}
            <code className="text-on-surface">useTheme()</code>.
          </li>
          <li>
            <span className="text-on-surface">Contrast</span> —{' '}
            <code className="text-on-surface">standard</code>,{' '}
            <code className="text-on-surface">medium</code> or{' '}
            <code className="text-on-surface">high</code>.
          </li>
          <li>
            <span className="text-on-surface">Motion</span> —{' '}
            <code className="text-on-surface">expressive</code> (the default) or{' '}
            <code className="text-on-surface">standard</code>. See the{' '}
            <a className="text-primary underline" href="/motion">
              Motion guide
            </a>
            .
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">ThemeProvider</h2>
        <p className="text-body-large text-on-surface-variant">
          Each dimension is controlled (<code className="text-on-surface">theme</code>/
          <code className="text-on-surface">mode</code>/
          <code className="text-on-surface">contrast</code>/
          <code className="text-on-surface">motion</code> with the matching{' '}
          <code className="text-on-surface">onChange</code>) or uncontrolled (the{' '}
          <code className="text-on-surface">default*</code> props). The selection is remembered via{' '}
          <code className="text-on-surface">storage</code> (
          <code className="text-on-surface">cookie</code> by default, or{' '}
          <code className="text-on-surface">local-storage</code>/
          <code className="text-on-surface">none</code>) under{' '}
          <code className="text-on-surface">storageKey</code> (default{' '}
          <code className="text-on-surface">windmorph-theme</code>), read with{' '}
          <code className="text-on-surface">useSyncExternalStore</code> so there is no hydration
          mismatch. <code className="text-on-surface">applyToDocument</code> (default true) writes
          the <code className="text-on-surface">data-*</code> attributes to{' '}
          <code className="text-on-surface">&lt;html&gt;</code>.
        </p>
        <CodeBlock code={PROVIDER_SNIPPET} html={providerHtml} lang="tsx" title="ThemeProvider" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Reading &amp; scoping the theme</h2>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">useTheme()</code> returns the current{' '}
          <code className="text-on-surface">theme</code>,{' '}
          <code className="text-on-surface">mode</code>,{' '}
          <code className="text-on-surface">contrast</code>,{' '}
          <code className="text-on-surface">motion</code>,{' '}
          <code className="text-on-surface">resolvedMode</code> and{' '}
          <code className="text-on-surface">themes</code>, plus{' '}
          <code className="text-on-surface">setTheme</code>/
          <code className="text-on-surface">setMode</code>/
          <code className="text-on-surface">setContrast</code>/
          <code className="text-on-surface">setMotion</code>. It throws outside a provider.{' '}
          <code className="text-on-surface">useThemeScope()</code> returns the effective state at a
          point in the tree.
        </p>
        <CodeBlock code={USE_THEME_SNIPPET} html={useThemeHtml} lang="tsx" title="useTheme" />
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">ThemeScope</code> re-themes a subtree. Any of its four
          props can be set; the rest inherit, and scopes nest.
        </p>
        <CodeBlock code={SCOPE_SNIPPET} html={scopeHtml} lang="tsx" title="ThemeScope" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Custom themes</h2>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">createTheme()</code> generates a theme from a seed
          colour with the M3 2025 colour spec. Pass the result in{' '}
          <code className="text-on-surface">ThemeProvider</code>’s{' '}
          <code className="text-on-surface">themes</code> prop.
        </p>
        <CodeBlock
          code={CREATE_THEME_SNIPPET}
          html={createThemeHtml}
          lang="tsx"
          title="createTheme"
        />
        <p className="text-body-large text-on-surface-variant">
          For static sites, the CLI writes the same CSS to a file. The only subcommand is{' '}
          <code className="text-on-surface">theme</code>.
        </p>
        <CodeBlock code={CLI_SNIPPET} html={cliHtml} lang="bash" title="Terminal" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Mixing palettes</h2>
        <p className="text-body-large text-on-surface-variant">
          An M3 scheme is built from six tonal palettes, the core colours of Material Theme Builder:{' '}
          <code className="text-on-surface">primary</code>,{' '}
          <code className="text-on-surface">secondary</code>,{' '}
          <code className="text-on-surface">tertiary</code>,{' '}
          <code className="text-on-surface">error</code>,{' '}
          <code className="text-on-surface">neutral</code> and{' '}
          <code className="text-on-surface">neutralVariant</code>. The{' '}
          <code className="text-on-surface">palettes</code> option takes any of them from another
          variant of the same seed, or from a hex colour. Every role still takes its tone from the
          M3 spec for the theme&apos;s own variant, so text keeps its contrast.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A common use is vivid accents on calm surfaces:{' '}
          <code className="text-on-surface">vibrant</code> tints the surfaces too, which can be
          strong in dark mode, so take the neutral palettes from{' '}
          <code className="text-on-surface">tonal-spot</code>. A hex neutral keeps its own chroma,
          so pick a greyish one; a variant source is the easy way to calm surfaces.
        </p>
        <PalettesDemo />
        <CodeBlock code={PALETTES_SNIPPET} html={palettesHtml} lang="tsx" title="palettes" />
        <CodeBlock
          code={palettesDemoSource}
          html={palettesDemoHtml}
          lang="tsx"
          title="palettes-demo.tsx"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Success and warning</h2>
        <p className="text-body-large text-on-surface-variant">
          M3 has no key colour for success or warning, so every theme adds them the way Material
          Theme Builder makes custom colours: a green and an amber, turned slightly toward the seed
          so they belong to the theme, each with <code className="text-on-surface">success</code>,{' '}
          <code className="text-on-surface">on-success</code>,{' '}
          <code className="text-on-surface">success-container</code> and{' '}
          <code className="text-on-surface">on-success-container</code> roles (and the same for
          warning). Their tones follow M3&apos;s error roles, so they have the same contrast in
          every mode and at every contrast level.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">customColors</code> sets your own, and{' '}
          <code className="text-on-surface">harmonize: false</code> keeps their exact hues.
        </p>
        <div className="grid gap-3 medium:grid-cols-2">
          {CUSTOM_SWATCHES.map(([name, strong, container]) => (
            <div key={name} className="flex overflow-hidden rounded-corner-medium text-label-large">
              <span className={`flex-1 px-4 py-3 ${strong}`}>{name}</span>
              <span className={`flex-1 px-4 py-3 ${container}`}>{name}-container</span>
            </div>
          ))}
        </div>
        <CodeBlock
          code={CUSTOM_COLORS_SNIPPET}
          html={customColorsHtml}
          lang="tsx"
          title="success and warning"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Overriding tokens</h2>
        <p className="text-body-large text-on-surface-variant">
          Themes set <code className="text-on-surface">--md-sys-color-*</code> under{' '}
          <code className="text-on-surface">[data-theme][data-mode]</code>. Override tokens globally
          on <code className="text-on-surface">:root</code> or per theme on{' '}
          <code className="text-on-surface">[data-theme=&quot;ocean&quot;]</code>. The four
          attributes are <code className="text-on-surface">data-theme</code>,{' '}
          <code className="text-on-surface">data-mode</code>,{' '}
          <code className="text-on-surface">data-contrast</code> and{' '}
          <code className="text-on-surface">data-motion</code>.
        </p>
        <CodeBlock code={TOKENS_SNIPPET} html={tokensHtml} lang="css" title="globals.css" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">No theme flash</h2>
        <p className="text-body-large text-on-surface-variant">
          With a server, read the cookie:{' '}
          <code className="text-on-surface">getThemeFromCookies()</code> from{' '}
          <code className="text-on-surface">@windmorph/react/next</code> and render{' '}
          <code className="text-on-surface">
            &lt;html {'{'}...themeAttributes(theme){'}'}&gt;
          </code>{' '}
          — see the{' '}
          <a className="text-primary underline" href="/nextjs">
            Next.js guide
          </a>
          . For a static or exported site, render{' '}
          <code className="text-on-surface">ThemeScript</code> in{' '}
          <code className="text-on-surface">&lt;head&gt;</code> with{' '}
          <code className="text-on-surface">suppressHydrationWarning</code> on{' '}
          <code className="text-on-surface">&lt;html&gt;</code>.{' '}
          <code className="text-on-surface">ThemeScript</code> and{' '}
          <code className="text-on-surface">DEFAULT_THEME_STATE</code> (
          <code className="text-on-surface">
            {'{ theme: "baseline", mode: "system", contrast: "standard", motion: "expressive" }'}
          </code>
          ) come from <code className="text-on-surface">@windmorph/react</code>, not{' '}
          <code className="text-on-surface">/next</code>.
        </p>
        <CodeBlock code={SCRIPT_SNIPPET} html={scriptHtml} lang="tsx" title="layout.tsx" />
      </section>
    </article>
  );
}
