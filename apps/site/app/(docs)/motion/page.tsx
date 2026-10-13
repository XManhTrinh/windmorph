import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { SpringDemo } from '../../../examples/motion/spring-demo';
import { readExampleSource } from '../../../lib/example-source';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';
import { InlineCode } from '../../../components/inline-code';

export const metadata: Metadata = guideMetadata('/motion');

const HOOK_SNIPPET = `import { useM3Spring } from '@windmorph/react';
import { motion } from 'motion/react';

function Expander() {
  // Spring for the active scheme (expressive by default), read from ThemeScope.
  const spring = useM3Spring('spatial', 'fast');
  return <motion.div animate={{ scale: 1 }} transition={spring} />;
}

// Scheme-independent: getM3Spring('standard', 'effects', 'default').`;

const CSS_SNIPPET = `/* Utilities read --md-sys-motion-* variables, which switch with data-motion. */
.card {
  transition-timing-function: var(--md-sys-motion-spring-spatial-default-easing);
}

/* Tailwind utilities (generated): ease-m3-<family>-<speed> and duration-m3-<family>-<speed>. */
<div className="transition-transform ease-m3-spatial-fast duration-m3-spatial-fast" />`;

const SPRINGS = [
  {
    scheme: 'expressive',
    family: 'spatial',
    fast: '0.6 / 800',
    def: '0.8 / 380',
    slow: '0.8 / 200',
  },
  {
    scheme: 'standard',
    family: 'spatial',
    fast: '0.9 / 1400',
    def: '0.9 / 700',
    slow: '0.9 / 300',
  },
  { scheme: 'both', family: 'effects', fast: '1 / 3800', def: '1 / 1600', slow: '1 / 800' },
] as const;

const LEGACY_EASINGS = [
  ['emphasized', 'cubic-bezier(0.2, 0, 0, 1)'],
  ['emphasized-accelerate', 'cubic-bezier(0.3, 0, 0.8, 0.15)'],
  ['emphasized-decelerate', 'cubic-bezier(0.05, 0.7, 0.1, 1)'],
  ['standard', 'cubic-bezier(0.2, 0, 0, 1)'],
  ['standard-accelerate', 'cubic-bezier(0.3, 0, 1, 1)'],
  ['standard-decelerate', 'cubic-bezier(0, 0, 0, 1)'],
  ['legacy', 'cubic-bezier(0.4, 0, 0.2, 1)'],
  ['legacy-accelerate', 'cubic-bezier(0.4, 0, 1, 1)'],
  ['legacy-decelerate', 'cubic-bezier(0, 0, 0.2, 1)'],
  ['linear', 'cubic-bezier(0, 0, 1, 1)'],
] as const;

export default async function MotionPage() {
  const demoSource = await readExampleSource('motion/spring-demo.tsx');
  const [demoHtml, hookHtml, cssHtml] = await Promise.all([
    highlightSource(demoSource, 'tsx'),
    highlightSource(HOOK_SNIPPET, 'tsx'),
    highlightSource(CSS_SNIPPET, 'tsx'),
  ]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Motion</h1>
        <p className="text-body-large text-on-surface-variant">
          M3 Expressive motion uses springs instead of duration-and-easing pairs. Two schemes, two
          spring families and three speeds cover every component, and they follow the active{' '}
          <InlineCode>data-motion</InlineCode> setting automatically.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 id="try-it" className="text-headline-small text-on-surface">
          Try it
        </h2>
        <p className="text-body-large text-on-surface-variant">
          The box below springs with the fast spatial spring. In the expressive scheme it
          overshoots; switch the top-bar motion toggle to standard (or enable{' '}
          <InlineCode>prefers-reduced-motion</InlineCode>) and the overshoot disappears.
        </p>
        {/* A live demo: the Markdown version of the page leaves it out. */}
        <div className="contents" data-markdown="skip">
          <SpringDemo family="spatial" speed="fast" />
        </div>
        <CodeBlock code={demoSource} html={demoHtml} lang="tsx" title="spring-demo.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="schemes-families-and-speeds" className="text-headline-small text-on-surface">
          Schemes, families &amp; speeds
        </h2>
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>
            <span className="text-on-surface">Schemes</span> — <InlineCode>expressive</InlineCode>{' '}
            (visible overshoot, the default) and <InlineCode>standard</InlineCode> (restrained). Set
            via <InlineCode>data-motion</InlineCode>, <InlineCode>ThemeProvider</InlineCode> or{' '}
            <InlineCode>ThemeScope</InlineCode>.
          </li>
          <li>
            <span className="text-on-surface">Families</span> — <InlineCode>spatial</InlineCode>{' '}
            (position, size, shape — may overshoot) and <InlineCode>effects</InlineCode> (colour,
            opacity — never overshoot, critically damped).
          </li>
          <li>
            <span className="text-on-surface">Speeds</span> — <InlineCode>fast</InlineCode>,{' '}
            <InlineCode>default</InlineCode> and <InlineCode>slow</InlineCode>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="spring-tokens" className="text-headline-small text-on-surface">
          Spring tokens
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Compose springs, given as damping ratio / stiffness (mass 1). Motion’s damping coefficient
          is derived as <InlineCode>2 · dampingRatio · √stiffness</InlineCode>.
        </p>
        <table className="w-full border-collapse text-body-medium">
          <thead>
            <tr>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                Scheme
              </th>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                Family
              </th>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                fast
              </th>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                default
              </th>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                slow
              </th>
            </tr>
          </thead>
          <tbody>
            {SPRINGS.map((row) => (
              <tr key={`${row.scheme}-${row.family}`}>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  {row.scheme}
                </td>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  {row.family}
                </td>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  {row.fast}
                </td>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  {row.def}
                </td>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  {row.slow}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-body-large text-on-surface-variant">
          Effects springs are shared by both schemes. Expressive spatial overshoots about 9% (fast)
          and 1.5% (default/slow); standard spatial shows no visible overshoot; effects never
          overshoot.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="using-springs" className="text-headline-small text-on-surface">
          Using springs
        </h2>
        <p className="text-body-large text-on-surface-variant">
          In JS, <InlineCode>useM3Spring(family, speed)</InlineCode> returns a Motion spring for the
          active scheme (read from <InlineCode>useThemeScope</InlineCode>);{' '}
          <InlineCode>getM3Spring(scheme, family, speed)</InlineCode> takes an explicit scheme.
          Speed defaults to <InlineCode>default</InlineCode>.
        </p>
        <CodeBlock code={HOOK_SNIPPET} html={hookHtml} lang="tsx" title="useM3Spring" />
        <p className="text-body-large text-on-surface-variant">
          In CSS, the <InlineCode>--md-sys-motion-spring-*</InlineCode> variables and the generated{' '}
          <InlineCode>ease-m3-&lt;family&gt;-&lt;speed&gt;</InlineCode> /{' '}
          <InlineCode>duration-m3-&lt;family&gt;-&lt;speed&gt;</InlineCode> utilities switch with{' '}
          <InlineCode>data-motion</InlineCode>.
        </p>
        <CodeBlock code={CSS_SNIPPET} html={cssHtml} lang="tsx" title="motion utilities" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="reduced-motion" className="text-headline-small text-on-surface">
          Reduced motion
        </h2>
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>useM3Spring</InlineCode> forces the <InlineCode>standard</InlineCode> scheme
          when <InlineCode>prefers-reduced-motion</InlineCode> is set (via Motion’s{' '}
          <InlineCode>useReducedMotion</InlineCode>), so it never visibly overshoots. Morphs and
          overshoot are removed; indeterminate motion that conveys activity stays.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="legacy-tokens" className="text-headline-small text-on-surface">
          Legacy tokens
        </h2>
        <p className="text-body-large text-on-surface-variant">
          For consumers migrating from baseline M3, legacy durations (
          <InlineCode>short-1</InlineCode> = 50ms … <InlineCode>extra-long-4</InlineCode> = 1000ms,
          in 50ms steps) and the legacy easing curves are kept:
        </p>
        <table className="w-full border-collapse text-body-medium">
          <thead>
            <tr>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                Easing
              </th>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                Curve
              </th>
            </tr>
          </thead>
          <tbody>
            {LEGACY_EASINGS.map(([name, curve]) => (
              <tr key={name}>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  <InlineCode>{name}</InlineCode>
                </td>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  <InlineCode>{curve}</InlineCode>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </article>
  );
}
