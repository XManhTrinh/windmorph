import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Button } from '@windmorph/react';
import { Accordion, AccordionItem, CodeBlock, PropsTable } from '@windmorph/react-pro';
import { InlineCode } from '../../../components/inline-code';
import { PageChips } from '../../../components/page-chips';
import { RegisterInterestForm } from '../../../components/register-interest-form';
import { componentTabHref } from '../../../content/components/doc';
import { highlightSource } from '../../../lib/highlight';
import { PRO_COMPONENTS_HREF, proPagesByGroup, proSummary } from '../../../lib/pro-catalog';
import { guideMetadata } from '../../../lib/site-metadata';

export const metadata: Metadata = guideMetadata('/pro');

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';
const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;

/** The core repository's discussions for component requests, where requests can be upvoted. */
const COMPONENT_REQUESTS_HREF =
  'https://github.com/XManhTrinh/windmorph/discussions/categories/component-requests';

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
      <Tag color="success">Paid</Tag>
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

const FAQ: { id: string; question: string; answer: ReactNode }[] = [
  {
    id: 'on-sale',
    question: 'Can I buy Pro today?',
    answer: (
      <>
        Not yet.{' '}
        <a href="#register" className={LINK}>
          Register interest
        </a>{' '}
        and you&apos;ll hear first when it opens.
      </>
    ),
  },
  {
    id: 'price',
    question: 'How much will it cost?',
    answer:
      "That isn't decided yet. People who register interest hear the price before anyone else.",
  },
  {
    id: 'email',
    question: 'What happens to my email?',
    answer: (
      <>
        A new address gets one email to confirm it, then only news about Windmorph Pro and its
        add-ons. Every email has a link to unsubscribe. The{' '}
        <a href="/privacy" className={LINK}>
          privacy notice
        </a>{' '}
        has the details.
      </>
    ),
  },
  {
    id: 'requests',
    question: 'Can I ask for a component?',
    answer: (
      <>
        Yes: name it in the form&apos;s &ldquo;What component is missing?&rdquo; box, or{' '}
        <a href={COMPONENT_REQUESTS_HREF} className={LINK}>
          request it in GitHub Discussions
        </a>
        , where others can upvote it.
      </>
    ),
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
 * form to register interest while it isn't on sale (its choices are the same catalog list),
 * how Pro sits beside the core, the docs components and the questions people ask.
 */
export default async function ProPage() {
  const groups = proPagesByGroup();
  const count = groups.reduce((total, { pages }) => total + pages.length, 0);
  const choices = groups.map(({ group, pages }) => ({
    id: group.id,
    label: group.fullName,
    choices: pages.map((page) => page.title),
  }));
  const [cssHtml, useHtml, docsHtml] = await Promise.all([
    highlightSource(CSS_SNIPPET, 'css'),
    highlightSource(USE_SNIPPET, 'tsx'),
    highlightSource(DOCS_SNIPPET, 'tsx'),
  ]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Windmorph Pro</h1>
        <p className={TEXT}>
          Windmorph Pro (<InlineCode>@windmorph/react-pro</InlineCode>) will be a paid set of
          components on top of the free core, <InlineCode>@windmorph/react</InlineCode>, and
          isn&apos;t on sale yet. It covers what Material 3 doesn&apos;t: alerts, avatars, tags,
          skeletons, empty states, phone and PIN fields, a message field with rich text, media
          viewers and uploads, and more. Its components are built only on the core&apos;s public
          API, so they follow the same tokens, themes, motion and accessibility rules, and the core
          stays complete and MIT without them.
        </p>
        <div>
          <Button variant="filled" size="md" href="#register">
            Register interest
          </Button>
        </div>
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
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading id="register">Register interest</SectionHeading>
        <p className={TEXT}>
          We&apos;ll email you when Pro opens. Your answers decide what we build and polish next.
        </p>
        <RegisterInterestForm
          interest="pro"
          source="pro-page"
          choicesLabel="Which Pro components would you use?"
          groups={choices}
        />
        <p className={TEXT}>
          Rather ask in public?{' '}
          <a href={COMPONENT_REQUESTS_HREF} className={LINK}>
            Request a component in GitHub Discussions
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading id="using-pro">Using Pro</SectionHeading>
        <p className={TEXT}>
          Pro installs beside the core, which it lists as a peer dependency, at the same minor
          version. Its rich text components (<InlineCode>@windmorph/react-pro/rich-text</InlineCode>
          ) also need the Tiptap packages Pro lists as optional peer dependencies.
        </p>
        <p className={TEXT}>
          Import Pro&apos;s stylesheet after the core&apos;s, and let Tailwind scan both packages.
          Without Tailwind, link <InlineCode>@windmorph/react-pro/styles.compiled.css</InlineCode>{' '}
          alone: it includes the core&apos;s.
        </p>
        <CodeBlock code={CSS_SNIPPET} html={cssHtml} lang="css" title="globals.css" />
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
