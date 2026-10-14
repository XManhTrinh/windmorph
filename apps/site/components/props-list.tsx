import { codeNameHref } from '../lib/code-name-href';
import type { PropsRecord } from '../lib/component-props';
import { markdownParagraphs } from '../lib/inline-markdown';
import {
  propListItems,
  type PropDefaultView,
  type PropItem,
  type PropTypeView,
} from '../lib/prop-list-model';
import { InlineCode } from './inline-code';
import { InlineMarkdown, type ResolveCodeName } from './inline-markdown';
import { MoreValues, PropKeys, PropLink } from './prop-list-controls';

/** A union with more members than this shows the first {@link UNION_PREVIEW} and folds the rest. */
const UNION_FOLD_AT = 16;
const UNION_PREVIEW = 12;

/** A long type or default: monospace on a quiet surface, wrapping anywhere it must. */
const CODE_BLOCK =
  'block whitespace-pre-wrap rounded-corner-small bg-surface-container-low px-3 py-2 font-mono text-body-small text-on-surface [overflow-wrap:anywhere]';

const DIVIDED = 'divide-y divide-outline-variant';

function TypeValue({ view }: { view: PropTypeView }) {
  if (view.kind === 'block') {
    return (
      <code dir="ltr" className={CODE_BLOCK}>
        {view.text}
      </code>
    );
  }
  if (view.kind === 'inline') return <InlineCode dir="ltr">{view.text}</InlineCode>;
  const chip = (value: string) => (
    <InlineCode key={value} dir="ltr">
      {value}
    </InlineCode>
  );
  const folds = view.values.length > UNION_FOLD_AT;
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="sr-only">One of </span>
      {(folds ? view.values.slice(0, UNION_PREVIEW) : view.values).map(chip)}
      {folds && (
        <MoreValues total={view.values.length}>
          {view.values.slice(UNION_PREVIEW).map(chip)}
        </MoreValues>
      )}
    </span>
  );
}

function DefaultValue({ view, resolve }: { view: PropDefaultView; resolve?: ResolveCodeName }) {
  if (view.kind === 'prose') return <InlineMarkdown text={view.text} resolve={resolve} />;
  if (view.kind === 'block') {
    return (
      <code dir="ltr" className={CODE_BLOCK}>
        {view.text}
      </code>
    );
  }
  return <InlineCode dir="ltr">{view.text}</InlineCode>;
}

/**
 * One prop: a header line with its name, a "Required" label, its anchor, its type and its
 * default; a long type or default wraps in a block under the name instead. The description
 * runs the list's full width below, and an object prop's keys fold under it. The item's data
 * attributes give the Markdown twin its table row.
 */
function PropEntry({ item, resolve }: { item: PropItem; resolve?: ResolveCodeName }) {
  const wide =
    item.type.kind === 'block' || (item.defaultValue && item.defaultValue.kind !== 'inline');
  return (
    <li
      id={item.id}
      data-prop={item.name}
      data-type={item.typeText}
      data-default={item.defaultText}
      data-required={item.required || undefined}
      className="flex scroll-mt-20 flex-col gap-2 py-4"
    >
      <div className="group/prop flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <InlineCode dir="ltr" className="bg-transparent px-0 text-title-small text-on-surface">
            {item.name}
          </InlineCode>
          {item.required && (
            <span className="rounded-corner-full bg-error-container px-2 py-0.5 text-label-small text-on-error-container">
              Required
            </span>
          )}
          <PropLink id={item.id} name={item.name} />
        </div>
        <dl
          className={`flex min-w-0 basis-full flex-wrap items-baseline gap-x-4 gap-y-2 text-body-medium ${wide ? '' : '@2xl:flex-1 @2xl:basis-0'}`}
        >
          <div className={item.type.kind === 'block' ? 'min-w-0 basis-full' : 'min-w-0'}>
            <dt className="sr-only">Type</dt>
            <dd>
              <TypeValue view={item.type} />
            </dd>
          </div>
          {item.defaultValue && (
            <div
              className={`flex min-w-0 items-baseline gap-2 ${item.defaultValue.kind === 'inline' ? '@2xl:ms-auto' : 'basis-full'}`}
            >
              <dt className="shrink-0 text-label-medium text-on-surface-variant">Default</dt>
              <dd className="min-w-0 flex-1 text-on-surface-variant">
                <DefaultValue view={item.defaultValue} resolve={resolve} />
              </dd>
            </div>
          )}
        </dl>
      </div>
      {item.description && (
        <div
          data-prop-description=""
          className="flex flex-col gap-2 text-body-medium text-on-surface-variant"
        >
          {markdownParagraphs(item.description).map((paragraph, index) => (
            <p key={index}>
              <InlineMarkdown text={paragraph} resolve={resolve} />
            </p>
          ))}
        </div>
      )}
      {item.keys.length > 0 && (
        <PropKeys count={item.keys.length}>
          <ul className={`ms-1 border-s-2 border-outline-variant ps-4 ${DIVIDED}`}>
            {item.keys.map((key) => (
              <PropEntry key={key.id} item={key} resolve={resolve} />
            ))}
          </ul>
        </PropKeys>
      )}
    </li>
  );
}

export interface PropsListProps {
  /** Names the list for assistive tech: `Button props`, `useTheme parameters`. */
  caption: string;
  /**
   * The component or hook the props belong to, which scopes their anchors
   * (`prop-<scope>-<name>`) so two lists on one page never share one.
   */
  scope: string;
  props: PropsRecord[];
}

/**
 * A component's props, one item per prop at every width: the name, a "Required" label, the
 * type and default on its header line (an enum's members as chips), and the description at
 * the list's full width below. An object prop's keys (`labels.close`, `classNames.root`)
 * nest under it behind a disclosure, and a `{@link Name}` in a description links to `Name`'s
 * page. A named region holding a list, so a screen reader can
 * jump to it and hear how many props there are. A Server Component; the disclosures and the
 * anchors' copy buttons are small client islands.
 */
export function PropsList({ caption, scope, props }: PropsListProps) {
  return (
    <section aria-label={caption} data-props-list="" className="@container">
      <ul className={`border-y border-outline-variant ${DIVIDED}`}>
        {propListItems(scope, props).map((item) => (
          <PropEntry key={item.id} item={item} resolve={codeNameHref} />
        ))}
      </ul>
    </section>
  );
}
