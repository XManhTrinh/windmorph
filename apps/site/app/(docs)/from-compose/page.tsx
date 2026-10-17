import type { Metadata } from 'next';
import { Fragment } from 'react';
import { Card, componentTokenList } from '@windmorph/react';
import { CodeText } from '../../../components/code-text';
import {
  COMPONENT_META,
  GALLERY_RAIL_GROUPS,
  pagesInRailGroup,
} from '../../../content/components/catalog';
import { componentTabHref } from '../../../content/components/doc';
import { COMPONENT_PAGES } from '../../../content/components/registry';
import { SPEC_DATA, type ComposeMapping } from '../../../content/components/spec-data';
import { loadComponentDoc } from '../../../lib/component-page';
import { guideMetadata } from '../../../lib/site-metadata';

export const metadata: Metadata = guideMetadata('/from-compose');

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

/** The conventions that carry over from every composable to every component. */
const CONVENTIONS: { compose: string; windmorph: string; note: string }[] = [
  {
    compose: '`Modifier`',
    windmorph: '`className`, `style`',
    note: 'Layout and spacing are Tailwind classes on the outermost element. `classNames` reaches the inner parts.',
  },
  {
    compose: '`onClick`',
    windmorph: '`onPress`',
    note: 'React Aria press events: mouse, touch, pen and keyboard alike.',
  },
  {
    compose: '`enabled = false`',
    windmorph: '`disabled`',
    note: 'Components with no disabled state in M3 (the FAB) have no `disabled` prop.',
  },
  {
    compose: '`checked`, `onCheckedChange`',
    windmorph: '`checked`, `onCheckedChange`',
    note: 'The same names on `Checkbox` and `Switch`; toggle buttons, chips and navigation items say `selected` / `onSelectedChange`, as Compose does. Every value is controlled or uncontrolled: `defaultChecked`, `defaultValue` and `defaultOpen` start one without state.',
  },
  {
    compose: '`contentDescription`',
    windmorph: '`aria-label`',
    note: 'Where a name is required (an icon-only button), the types require it.',
  },
  {
    compose: '`colors = …Defaults.colors()`',
    windmorph: '`classNames`, `--md-comp-*` tokens',
    note: 'Colours are semantic roles, overridden per part or through component tokens.',
  },
  {
    compose: '`shapes = …Defaults.shapes()`',
    windmorph: '`shape`',
    note: 'Round or square, with the press morph built in.',
  },
  {
    compose: '`MaterialExpressiveTheme(colorScheme, motionScheme)`',
    windmorph: '`ThemeProvider` (`theme`, `mode`, `contrast`, `motion`)',
    note: '`createTheme({ name, seed })` generates a whole colour scheme, every contrast level included, from one seed colour.',
  },
  {
    compose: '`MotionScheme.expressive()`, `MotionScheme.standard()`',
    windmorph: '`motion="expressive"`, `motion="standard"`',
    note: '`useM3Spring` reads the current scheme’s springs for your own motion.',
  },
  {
    compose: '`MaterialShapes`, `Morph`',
    windmorph: '`MaterialShapes`, `Morph`, `useM3Morph`',
    note: 'A port of `androidx.graphics.shapes`, from `@windmorph/react/primitives`.',
  },
];

interface Row {
  slug: string;
  title: string;
  mapping: ComposeMapping;
}

/** The mappings of one gallery group, in its pages' order. */
function rowsOf(groupId: (typeof GALLERY_RAIL_GROUPS)[number]['id']): Row[] {
  return pagesInRailGroup(groupId).flatMap((meta) =>
    (SPEC_DATA[meta.slug]?.compose ?? []).map((mapping) => ({
      slug: meta.slug,
      title: meta.title,
      mapping,
    })),
  );
}

function Params({ mapping }: { mapping: ComposeMapping }) {
  if (!mapping.params || mapping.params.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1">
      {mapping.params.map((param) => (
        <li key={param.compose}>
          <CodeText text={`\`${param.compose}\``} /> → <CodeText text={`\`${param.windmorph}\``} />
          {param.note && (
            <>
              {': '}
              <CodeText text={param.note} />
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

/** One group's mappings: a table from medium windows up, cards on phones. */
function MappingTable({ rows, caption }: { rows: Row[]; caption: string }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-corner-large border border-outline-variant medium:block">
        <table className="w-full table-fixed border-collapse text-body-medium [overflow-wrap:anywhere]">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-container text-label-large text-on-surface-variant">
            <tr>
              <th scope="col" className="w-[34%] px-4 py-3 text-start text-label-large">
                Compose
              </th>
              <th scope="col" className="px-4 py-3 text-start text-label-large">
                Windmorph
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ slug, title, mapping }) => (
              <tr
                key={`${slug}-${mapping.composable}`}
                className="border-t border-outline-variant align-top"
              >
                <th scope="row" className="px-4 py-3 text-start text-body-medium text-on-surface">
                  <CodeText text={`\`${mapping.composable}\``} />
                </th>
                <td className="px-4 py-3 text-on-surface-variant">
                  <div className="flex flex-col gap-2">
                    <span>
                      <CodeText text={`\`${mapping.component}\``} /> ·{' '}
                      <a href={componentTabHref(slug)} className={LINK}>
                        {title}
                      </a>
                    </span>
                    <Params mapping={mapping} />
                    {mapping.note && (
                      <span>
                        <CodeText text={mapping.note} />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul aria-label={caption} className="flex flex-col gap-3 medium:hidden">
        {rows.map(({ slug, title, mapping }) => (
          <li key={`${slug}-${mapping.composable}`}>
            <Card variant="outlined" className="gap-2 p-4 text-body-medium text-on-surface-variant">
              <p className="text-title-small text-on-surface">
                <CodeText text={`\`${mapping.composable}\``} />
              </p>
              <p>
                → <CodeText text={`\`${mapping.component}\``} /> ·{' '}
                <a href={componentTabHref(slug)} className={LINK}>
                  {title}
                </a>
              </p>
              <Params mapping={mapping} />
              {mapping.note && (
                <p>
                  <CodeText text={mapping.note} />
                </p>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}

interface TokenGroup {
  slug: string;
  title: string;
  tokens: { compose: string; name: string }[];
}

/**
 * Every component token that names its Compose twin, grouped by component page, read from
 * the same token sets that write the CSS variables and the API tabs' token tables.
 */
async function composeTokenGroups(): Promise<TokenGroup[]> {
  const groups = await Promise.all(
    COMPONENT_PAGES.filter((page) => !page.pro).map(async (page) => {
      const doc = await loadComponentDoc(page);
      const tokens = (doc.tokens ?? []).flatMap((set) =>
        componentTokenList(set).flatMap(({ compose, name }) =>
          compose ? [{ compose, name }] : [],
        ),
      );
      return { slug: page.slug, title: page.title, tokens };
    }),
  );
  return groups.filter(({ tokens }) => tokens.length > 0);
}

/** Compose `*Tokens` names beside the CSS variables that override the same thing. */
function ComposeTokenTable({ groups }: { groups: TokenGroup[] }) {
  return (
    <div className="overflow-hidden rounded-corner-large border border-outline-variant">
      <table className="w-full table-fixed border-collapse text-body-medium [overflow-wrap:anywhere]">
        <caption className="sr-only">Compose tokens and their Windmorph CSS variables</caption>
        <thead className="bg-surface-container text-label-large text-on-surface-variant">
          <tr>
            <th scope="col" className="w-1/2 px-4 py-3 text-start text-label-large">
              Compose
            </th>
            <th scope="col" className="px-4 py-3 text-start text-label-large">
              Windmorph
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ slug, title, tokens }) => (
            <Fragment key={slug}>
              <tr className="border-t border-outline-variant bg-surface-container-low">
                <th
                  scope="colgroup"
                  colSpan={2}
                  className="px-4 py-2 text-start text-title-small text-on-surface"
                >
                  <a href={`${componentTabHref(slug, 'api')}#tokens`} className={LINK}>
                    {title}
                  </a>
                </th>
              </tr>
              {tokens.map(({ compose, name }) => (
                <tr key={name} className="border-t border-outline-variant align-top">
                  <th scope="row" className="px-4 py-3 text-start text-body-medium text-on-surface">
                    <CodeText text={`\`${compose}\``} />
                  </th>
                  <td className="px-4 py-3 text-on-surface-variant">
                    <CodeText text={`\`${name}\``} />
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function FromComposePage() {
  const tokenGroups = await composeTokenGroups();
  const groups = GALLERY_RAIL_GROUPS.map((group) => ({ group, rows: rowsOf(group.id) })).filter(
    ({ rows }) => rows.length > 0,
  );
  const composableCount = COMPONENT_META.reduce(
    (sum, meta) => sum + (SPEC_DATA[meta.slug]?.compose?.length ?? 0),
    0,
  );
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">From Compose</h1>
        <p className="text-body-large text-on-surface-variant">
          Coming from Jetpack Compose Material 3? Both follow the same M3 Expressive spec, so the
          components line up closely. Here are {composableCount} composables and their key
          parameters, each with the Windmorph component and props that do the same job. Where they
          differ, the spec decides, and each component&apos;s API tab says how.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 id="conventions" className="text-headline-small text-on-surface">
          Conventions
        </h2>
        <p className="text-body-large text-on-surface-variant">
          These carry over from every composable to every component.
        </p>
        <ul className="flex flex-col gap-3">
          {CONVENTIONS.map((row) => (
            <li key={row.compose}>
              <Card variant="outlined" className="gap-1 p-4">
                <p className="text-body-large text-on-surface">
                  <CodeText text={row.compose} /> → <CodeText text={row.windmorph} />
                </p>
                <p className="text-body-medium text-on-surface-variant">
                  <CodeText text={row.note} />
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {groups.map(({ group, rows }) => (
        <section key={group.id} className="flex flex-col gap-4">
          <h2 id={group.id} className="text-headline-small text-on-surface">
            {group.fullName}
          </h2>
          <MappingTable rows={rows} caption={`${group.fullName}: Compose to Windmorph`} />
        </section>
      ))}

      <section className="flex flex-col gap-4">
        <h2 id="tokens" className="text-headline-small text-on-surface">
          Your <CodeText text="`*Tokens`" /> overrides
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Compose&apos;s component tokens are CSS variables here: where you read{' '}
          <CodeText text="`FilledButtonTokens.ContainerColor`" />, set{' '}
          <CodeText text="`--md-comp-button-filled-container-color`" />. Each is unset until you set
          it, globally, per theme or on one part of the page; see{' '}
          <a href="/customisation#component-tokens" className={LINK}>
            Component tokens
          </a>
          .
        </p>
        <ComposeTokenTable groups={tokenGroups} />
      </section>
    </article>
  );
}
