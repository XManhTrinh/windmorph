import type { Metadata } from 'next';
import { Accordion, AccordionItem, CodeBlock, PropsTable } from '@windmorph/react-pro';
import { InlineCode } from '../../../components/inline-code';
import { InstallCommand } from '../../../components/install-command';
import { PageChips } from '../../../components/page-chips';
import { componentTabHref } from '../../../content/components/doc';
import { highlightSource } from '../../../lib/highlight';
import { PRO_COMPONENTS_HREF, proPagesByGroup, proSummary } from '../../../lib/pro-catalog';
import { guideMetadata } from '../../../lib/site-metadata';

export const metadata: Metadata = guideMetadata('/pro');

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';
const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;

const NPMRC_SNIPPET = `# Example only: use the registry address that comes with your token.
@windmorph:registry=https://registry.example.com/
//registry.example.com/:_authToken=\${WINDMORPH_PRO_TOKEN}`;

const CSS_SNIPPET = `@import 'tailwindcss';
@import '@windmorph/react/styles.css';
@import '@windmorph/react-pro/styles.css';
@source '../node_modules/@windmorph/react';
@source '../node_modules/@windmorph/react-pro';`;

const USE_SNIPPET = `import { ThemeProvider } from '@windmorph/react';
import { Tag } from '@windmorph/react-pro';

export function App() {
  return (
    <ThemeProvider defaultTheme="baseline">
      <Tag tone="success">Paid</Tag>
    </ThemeProvider>
  );
}`;

const DOCS_SNIPPET = `import { CodeBlock, PropsTable } from '@windmorph/react-pro';

<CodeBlock code={source} html={highlighted} lang="tsx" title="App.tsx" />
<PropsTable caption="Tag props" rows={tagProps} />`;

/** A few of Tag's props, as the live PropsTable sample shows them. */
const SAMPLE_ROWS = [
  {
    name: 'children',
    type: 'ReactNode',
    required: true,
    description: 'The label: one or a few words.',
  },
  {
    name: 'variant',
    type: '"tonal" | "filled" | "outlined"',
    defaultValue: '"tonal"',
    description: 'A container colour, the strong colour or an outline.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: '20, 24 or 32px tall.',
  },
  {
    name: 'maxWidth',
    type: "CSSProperties['maxWidth']",
    description: 'Cuts a long label short, with its full text in a tooltip.',
  },
];

const FAQ = [
  {
    id: 'on-sale',
    question: 'Can I buy Pro today?',
    answer:
      "Not yet. Its components are documented here in full so you can see what's coming; pricing will be announced with the licence.",
  },
  {
    id: 'tailwind',
    question: 'Do I need Tailwind CSS?',
    answer:
      'No. Without Tailwind, link @windmorph/react-pro/styles.compiled.css alone: it includes the core’s styles.',
  },
  {
    id: 'versions',
    question: 'Which version of the core does Pro need?',
    answer:
      'The same minor version. Pro lists the core as a peer dependency, so core fixes reach Pro through a normal update, and both are released together until 1.0.',
  },
  {
    id: 'tiptap',
    question: 'Does every app need Tiptap?',
    answer:
      'Only an app that uses the rich text entry, @windmorph/react-pro/rich-text. The Tiptap packages are optional peer dependencies, so other apps never install them.',
  },
  {
    id: 'theming',
    question: 'Do Pro components follow my theme?',
    answer:
      'Yes. They read the core’s ThemeProvider and M3 colour roles, so every theme, mode, contrast level and density reaches them, and most have --wm-* tokens of their own to override.',
  },
];

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-headline-small text-on-surface">
      {children}
    </h2>
  );
}

/**
 * The Windmorph Pro guide: what Pro is, the components it includes (from the catalog), the
 * planned licence and how a buyer installs it with a token.
 */
export default async function ProPage() {
  const groups = proPagesByGroup();
  const count = groups.reduce((total, { pages }) => total + pages.length, 0);
  const [npmrcHtml, cssHtml, useHtml, docsHtml] = await Promise.all([
    highlightSource(NPMRC_SNIPPET, 'ini'),
    highlightSource(CSS_SNIPPET, 'css'),
    highlightSource(USE_SNIPPET, 'tsx'),
    highlightSource(DOCS_SNIPPET, 'tsx'),
  ]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Windmorph Pro</h1>
        <p className={TEXT}>
          Windmorph Pro (<InlineCode>@windmorph/react-pro</InlineCode>) is a paid set of components
          on top of the free core, <InlineCode>@windmorph/react</InlineCode>. It covers what
          Material 3 doesn&apos;t: alerts, avatars, tags, skeletons, empty states, phone and PIN
          fields, a message field with rich text, media viewers and uploads, and more. Its
          components are built only on the core&apos;s public API, so they follow the same tokens,
          themes, motion and accessibility rules, and the core stays complete and MIT without them.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <SectionHeading id="whats-included">What&apos;s included</SectionHeading>
        <p className={TEXT}>
          {count} components today, each with its own page, live examples and props, marked{' '}
          <PageChips pro /> in the navigation.{' '}
          <a href={PRO_COMPONENTS_HREF} className={LINK}>
            Browse the Pro components
          </a>{' '}
          in the components index.
        </p>
        {groups.map(({ group, pages }) => (
          <div key={group.id} className="flex flex-col gap-2">
            <h3 className="text-title-medium text-on-surface">{group.fullName}</h3>
            <ul className={LIST}>
              {pages.map((page) => (
                <li key={page.slug}>
                  <a href={componentTabHref(page.slug)} className={LINK}>
                    {page.title}
                  </a>
                  : {proSummary(page.summary)}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className={TEXT}>Add-on kits are planned.</p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading id="licence">Licence</SectionHeading>
        <p className={TEXT}>
          Pro isn&apos;t on sale yet. It will be sold under a commercial licence; the licence terms
          and pricing will be announced before it goes on sale.
        </p>
        <p className={TEXT}>
          The core, <InlineCode>@windmorph/react</InlineCode>, stays free under the MIT licence.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading id="install">Install</SectionHeading>
        <p className={TEXT}>
          Pro comes from a private package registry, not the public npm registry. When you buy it,
          you get an install token. Tell your package manager to fetch{' '}
          <InlineCode>@windmorph</InlineCode> packages from the Pro registry with that token, in an{' '}
          <InlineCode>.npmrc</InlineCode> file beside your <InlineCode>package.json</InlineCode>.
          The registry&apos;s address comes with the token; the one below is a placeholder.
        </p>
        <CodeBlock code={NPMRC_SNIPPET} html={npmrcHtml} lang="ini" title=".npmrc" />
        <p className={TEXT}>
          Keep the token out of your repository: the file reads it from the{' '}
          <InlineCode>WINDMORPH_PRO_TOKEN</InlineCode> environment variable, which you set on your
          machine, in CI and on your host.
        </p>
        <p className={TEXT}>
          Then install Pro beside the core, which it lists as a peer dependency, at the same minor
          version:
        </p>
        <InstallCommand packages="@windmorph/react @windmorph/react-pro motion" />
        <p className={TEXT}>
          The rich text components (<InlineCode>@windmorph/react-pro/rich-text</InlineCode>) also
          need the Tiptap packages Pro lists as optional peer dependencies.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading id="styles">Add the stylesheet</SectionHeading>
        <p className={TEXT}>
          Import Pro&apos;s stylesheet after the core&apos;s, and let Tailwind scan both packages.
          Without Tailwind, link <InlineCode>@windmorph/react-pro/styles.compiled.css</InlineCode>{' '}
          alone: it includes the core&apos;s.
        </p>
        <CodeBlock code={CSS_SNIPPET} html={cssHtml} lang="css" title="globals.css" />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading id="use">Use it</SectionHeading>
        <p className={TEXT}>
          Pro components read the theme from the core&apos;s <InlineCode>ThemeProvider</InlineCode>,
          so they follow every theme, mode and contrast level with no setup of their own. Each
          component page shows its import line.
        </p>
        <CodeBlock code={USE_SNIPPET} html={useHtml} lang="tsx" title="App.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading id="docs-components">Components for your docs</SectionHeading>
        <p className={TEXT}>
          Pro also has the two components this site&apos;s pages are built with, for documenting
          your own components. <InlineCode>CodeBlock</InlineCode> shows highlighted source with a
          title and a copy button; its words come from <InlineCode>labels</InlineCode> (
          <InlineCode>copy</InlineCode>, <InlineCode>copied</InlineCode>, and{' '}
          <InlineCode>region</InlineCode>, which names the code when it has no title), and a copy is
          announced to screen readers. <InlineCode>PropsTable</InlineCode> is a props table: name,
          type, default and description, one row per prop, in a focusable region that scrolls
          sideways on small screens. Its caption and column headings come from{' '}
          <InlineCode>labels</InlineCode> (<InlineCode>caption</InlineCode>,{' '}
          <InlineCode>name</InlineCode>, <InlineCode>type</InlineCode>,{' '}
          <InlineCode>default</InlineCode>, <InlineCode>description</InlineCode>,{' '}
          <InlineCode>required</InlineCode>), and <InlineCode>classNames</InlineCode> styles each
          part. Neither is a general data table: no sorting, selection or pagination.
        </p>
        <CodeBlock code={DOCS_SNIPPET} html={docsHtml} lang="tsx" title="Docs.tsx" />
        <PropsTable caption="Tag props (sample)" rows={SAMPLE_ROWS} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading id="faq">Questions</SectionHeading>
        <Accordion headingLevel={3} defaultExpandedKeys={['on-sale']}>
          {FAQ.map(({ id, question, answer }) => (
            <AccordionItem key={id} id={id} title={question}>
              {answer}
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </article>
  );
}
