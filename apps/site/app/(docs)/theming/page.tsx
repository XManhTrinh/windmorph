import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { PalettesDemo } from '../../../examples/theming/palettes-demo';
import { ThemeSwitcherDemo } from '../../../examples/theming/theme-switcher-demo';
import { readExampleSource } from '../../../lib/example-source';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';
import { InlineCode } from '../../../components/inline-code';

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
          This live demo drives a <InlineCode>ThemeScope</InlineCode> around the preview card, so
          the controls re-theme the card without touching the rest of the page.
        </p>
        <ThemeSwitcherDemo />
        <CodeBlock code={demoSource} html={demoHtml} lang="tsx" title="theme-switcher-demo.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">The four dimensions</h2>
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>
            <span className="text-on-surface">Theme</span> — six built-ins: baseline (the default,
            seed <InlineCode>#6750A4</InlineCode>), ocean (<InlineCode>#0061A4</InlineCode>), forest
            (<InlineCode>#386A20</InlineCode>), sunset (<InlineCode>#A04100</InlineCode>), rose (
            <InlineCode>#9C4146</InlineCode>) and slate (<InlineCode>#545F71</InlineCode>, the only{' '}
            <InlineCode>neutral</InlineCode> variant; the rest are{' '}
            <InlineCode>tonal-spot</InlineCode>). Scheme variants are{' '}
            <InlineCode>tonal-spot</InlineCode>, <InlineCode>neutral</InlineCode>,{' '}
            <InlineCode>vibrant</InlineCode> and <InlineCode>expressive</InlineCode>.
          </li>
          <li>
            <span className="text-on-surface">Mode</span> — <InlineCode>light</InlineCode>,{' '}
            <InlineCode>dark</InlineCode> or <InlineCode>system</InlineCode>.{' '}
            <InlineCode>system</InlineCode> follows <InlineCode>prefers-color-scheme</InlineCode>{' '}
            and resolves to <InlineCode>resolvedMode</InlineCode> on{' '}
            <InlineCode>useTheme()</InlineCode>.
          </li>
          <li>
            <span className="text-on-surface">Contrast</span> — <InlineCode>standard</InlineCode>,{' '}
            <InlineCode>medium</InlineCode> or <InlineCode>high</InlineCode>.
          </li>
          <li>
            <span className="text-on-surface">Motion</span> — <InlineCode>expressive</InlineCode>{' '}
            (the default) or <InlineCode>standard</InlineCode>. See the{' '}
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
          Each dimension is controlled (<InlineCode>theme</InlineCode>/<InlineCode>mode</InlineCode>
          /<InlineCode>contrast</InlineCode>/<InlineCode>motion</InlineCode> with the matching{' '}
          <InlineCode>onChange</InlineCode>) or uncontrolled (the <InlineCode>default*</InlineCode>{' '}
          props). The selection is remembered via <InlineCode>storage</InlineCode> (
          <InlineCode>cookie</InlineCode> by default, or <InlineCode>local-storage</InlineCode>/
          <InlineCode>none</InlineCode>) under <InlineCode>storageKey</InlineCode> (default{' '}
          <InlineCode>windmorph-theme</InlineCode>), read with{' '}
          <InlineCode>useSyncExternalStore</InlineCode> so there is no hydration mismatch.{' '}
          <InlineCode>applyToDocument</InlineCode> (default true) writes the{' '}
          <InlineCode>data-*</InlineCode> attributes to <InlineCode>&lt;html&gt;</InlineCode>.
        </p>
        <CodeBlock code={PROVIDER_SNIPPET} html={providerHtml} lang="tsx" title="ThemeProvider" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Reading &amp; scoping the theme</h2>
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>useTheme()</InlineCode> returns the current <InlineCode>theme</InlineCode>,{' '}
          <InlineCode>mode</InlineCode>, <InlineCode>contrast</InlineCode>,{' '}
          <InlineCode>motion</InlineCode>, <InlineCode>resolvedMode</InlineCode> and{' '}
          <InlineCode>themes</InlineCode>, plus <InlineCode>setTheme</InlineCode>/
          <InlineCode>setMode</InlineCode>/<InlineCode>setContrast</InlineCode>/
          <InlineCode>setMotion</InlineCode>. It throws outside a provider.{' '}
          <InlineCode>useThemeScope()</InlineCode> returns the effective state at a point in the
          tree.
        </p>
        <CodeBlock code={USE_THEME_SNIPPET} html={useThemeHtml} lang="tsx" title="useTheme" />
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>ThemeScope</InlineCode> re-themes a subtree. Any of its four props can be set;
          the rest inherit, and scopes nest.
        </p>
        <CodeBlock code={SCOPE_SNIPPET} html={scopeHtml} lang="tsx" title="ThemeScope" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Custom themes</h2>
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>createTheme()</InlineCode> generates a theme from a seed colour with the M3
          2025 colour spec. Pass the result in <InlineCode>ThemeProvider</InlineCode>’s{' '}
          <InlineCode>themes</InlineCode> prop.
        </p>
        <CodeBlock
          code={CREATE_THEME_SNIPPET}
          html={createThemeHtml}
          lang="tsx"
          title="createTheme"
        />
        <p className="text-body-large text-on-surface-variant">
          For static sites, the CLI writes the same CSS to a file. The only subcommand is{' '}
          <InlineCode>theme</InlineCode>.
        </p>
        <CodeBlock code={CLI_SNIPPET} html={cliHtml} lang="bash" title="Terminal" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">Mixing palettes</h2>
        <p className="text-body-large text-on-surface-variant">
          An M3 scheme is built from six tonal palettes, the core colours of Material Theme Builder:{' '}
          <InlineCode>primary</InlineCode>, <InlineCode>secondary</InlineCode>,{' '}
          <InlineCode>tertiary</InlineCode>, <InlineCode>error</InlineCode>,{' '}
          <InlineCode>neutral</InlineCode> and <InlineCode>neutralVariant</InlineCode>. The{' '}
          <InlineCode>palettes</InlineCode> option takes any of them from another variant of the
          same seed, or from a hex colour. Every role still takes its tone from the M3 spec for the
          theme&apos;s own variant, so text keeps its contrast.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A common use is vivid accents on calm surfaces: <InlineCode>vibrant</InlineCode> tints the
          surfaces too, which can be strong in dark mode, so take the neutral palettes from{' '}
          <InlineCode>tonal-spot</InlineCode>. A hex neutral keeps its own chroma, so pick a greyish
          one; a variant source is the easy way to calm surfaces.
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
          so they belong to the theme, each with <InlineCode>success</InlineCode>,{' '}
          <InlineCode>on-success</InlineCode>, <InlineCode>success-container</InlineCode> and{' '}
          <InlineCode>on-success-container</InlineCode> roles (and the same for warning). Their
          tones follow M3&apos;s error roles, so they have the same contrast in every mode and at
          every contrast level.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>customColors</InlineCode> sets your own, and{' '}
          <InlineCode>harmonize: false</InlineCode> keeps their exact hues.
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
          Themes set <InlineCode>--md-sys-color-*</InlineCode> under{' '}
          <InlineCode>[data-theme][data-mode]</InlineCode>. Override tokens globally on{' '}
          <InlineCode>:root</InlineCode> or per theme on{' '}
          <InlineCode>[data-theme=&quot;ocean&quot;]</InlineCode>. The four attributes are{' '}
          <InlineCode>data-theme</InlineCode>, <InlineCode>data-mode</InlineCode>,{' '}
          <InlineCode>data-contrast</InlineCode> and <InlineCode>data-motion</InlineCode>.
        </p>
        <CodeBlock code={TOKENS_SNIPPET} html={tokensHtml} lang="css" title="globals.css" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-small text-on-surface">No theme flash</h2>
        <p className="text-body-large text-on-surface-variant">
          With a server, read the cookie: <InlineCode>getThemeFromCookies()</InlineCode> from{' '}
          <InlineCode>@windmorph/react/next</InlineCode> and render{' '}
          <InlineCode>
            &lt;html {'{'}...themeAttributes(theme){'}'}&gt;
          </InlineCode>{' '}
          — see the{' '}
          <a className="text-primary underline" href="/nextjs">
            Next.js guide
          </a>
          . For a static or exported site, render <InlineCode>ThemeScript</InlineCode> in{' '}
          <InlineCode>&lt;head&gt;</InlineCode> with{' '}
          <InlineCode>suppressHydrationWarning</InlineCode> on <InlineCode>&lt;html&gt;</InlineCode>
          . <InlineCode>ThemeScript</InlineCode> and <InlineCode>DEFAULT_THEME_STATE</InlineCode> (
          <InlineCode>
            {'{ theme: "baseline", mode: "system", contrast: "standard", motion: "expressive" }'}
          </InlineCode>
          ) come from <InlineCode>@windmorph/react</InlineCode>, not <InlineCode>/next</InlineCode>.
        </p>
        <CodeBlock code={SCRIPT_SNIPPET} html={scriptHtml} lang="tsx" title="layout.tsx" />
      </section>
    </article>
  );
}
