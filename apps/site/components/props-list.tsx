import { codeNameHref } from '../lib/code-name-href';
import type { PropsRecord } from '../lib/component-props';
import { markdownParagraphs } from '../lib/inline-markdown';
import {
  FOLDED_GROUPS,
  groupPropItems,
  htmlAttributesNote,
  propCount,
  propListItems,
  type PropItem,
} from '../lib/prop-list-model';
import { InlineMarkdown } from './inline-markdown';
import { MoreValues, PropGroupFold, PropKeys, PropLink, PropsFilter } from './prop-list-controls';

/** A union with more members than this shows the first {@link UNION_PREVIEW} and folds the rest. */
const UNION_FOLD_AT = 16;
const UNION_PREVIEW = 12;

/** A type member or default longer than this may wrap inside; shorter ones wrap around it. */
const UNBROKEN_MEMBER_MAX = 32;

/** Pages with more props than this, across their components, get the filter field. */
export const FILTER_FROM = 12;

/** Code set as text, without the chip that inline code in prose gets (`globals.css`). */
const PLAIN_CODE = 'rounded-none bg-transparent p-0 font-mono';

/** Quiet code in a prop's first line: its type and default. */
const CODE_TEXT = `${PLAIN_CODE} text-body-small text-on-surface-variant [overflow-wrap:anywhere]`;

const DIVIDED = 'divide-y divide-outline-variant';

/** The type, reading like TypeScript: its members joined by `|`, wrapping between them. */
function TypeText({ members }: { members: readonly string[] }) {
  const member = (value: string, index: number) => (
    <span key={index}>
      {index > 0 && ' | '}
      <span className={value.length <= UNBROKEN_MEMBER_MAX ? 'whitespace-nowrap' : undefined}>
        {value}
      </span>
    </span>
  );
  const folds = members.length > UNION_FOLD_AT;
  return (
    <code dir="ltr" className={CODE_TEXT}>
      {(folds ? members.slice(0, UNION_PREVIEW) : members).map(member)}
      {folds && (
        <MoreValues total={members.length}>
          {members.slice(UNION_PREVIEW).map((value, index) => member(value, index + UNION_PREVIEW))}
        </MoreValues>
      )}
    </code>
  );
}

/**
 * One prop, the same structure in every row: its name, type, a "Required" label and
 * `= default`, left-aligned and wrapping like text (on one run in a wide list; in a narrow
 * one the type and default take the line under the name), then its description at the
 * list's full width. An object prop's keys fold under it. The item's data attributes give the
 * Markdown twin its table row and the filter its text.
 */
function PropEntry({ item }: { item: PropItem }) {
  return (
    <li
      id={item.id}
      data-prop={item.name}
      data-type={item.typeText}
      data-default={item.defaultText}
      data-required={item.required || undefined}
      className="flex scroll-mt-20 flex-col gap-1 py-3"
    >
      {/* Wide lists read the first line as one run of text; narrower ones (under a 42rem list)
          give the name, Required and the anchor a line, and the type and default the next. */}
      <div
        data-prop-header=""
        className="group/prop flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-body-small @2xl:block"
      >
        <code
          data-prop-name=""
          dir="ltr"
          className={`order-1 ${PLAIN_CODE} text-title-small text-on-surface [overflow-wrap:anywhere] @2xl:me-3`}
        >
          {item.name}
        </code>
        <span className="order-5 min-w-0">
          <span className="sr-only">type </span>
          <TypeText members={item.typeMembers} />
        </span>
        {item.required && (
          <span className="order-2 whitespace-nowrap text-label-medium text-error @2xl:ms-3">
            Required
          </span>
        )}
        {item.defaultValue && (
          <span
            className={`order-6 min-w-0 @2xl:ms-3 ${
              item.defaultValue.kind === 'code' &&
              item.defaultValue.text.length <= UNBROKEN_MEMBER_MAX
                ? 'whitespace-nowrap'
                : ''
            }`}
          >
            <span aria-hidden="true" className="font-mono text-on-surface-variant">
              ={' '}
            </span>
            <span className="sr-only">default </span>
            {item.defaultValue.kind === 'code' ? (
              <code dir="ltr" className={CODE_TEXT}>
                {item.defaultValue.text}
              </code>
            ) : (
              <span className="text-on-surface-variant">
                <InlineMarkdown text={item.defaultValue.text} resolve={codeNameHref} />
              </span>
            )}
          </span>
        )}
        <span className="order-3 -my-2 inline-flex align-middle @2xl:ms-1">
          <PropLink id={item.id} name={item.name} />
        </span>
        <span aria-hidden="true" className="order-4 basis-full @2xl:hidden" />
      </div>
      {item.description && (
        <div
          data-prop-description=""
          className="flex flex-col gap-2 text-body-medium text-on-surface-variant"
        >
          {markdownParagraphs(item.description).map((paragraph, index) => (
            <p key={index}>
              <InlineMarkdown text={paragraph} resolve={codeNameHref} />
            </p>
          ))}
        </div>
      )}
      {item.keys.length > 0 && (
        <PropKeys count={item.keys.length}>
          <ul className={`ms-1 border-s-2 border-outline-variant ps-4 ${DIVIDED}`}>
            {item.keys.map((key) => (
              <PropEntry key={key.id} item={key} />
            ))}
          </ul>
        </PropKeys>
      )}
    </li>
  );
}

function PropItems({ items }: { items: readonly PropItem[] }) {
  return (
    <ul className={`border-y border-outline-variant ${DIVIDED}`}>
      {items.map((item) => (
        <PropEntry key={item.id} item={item} />
      ))}
    </ul>
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
  /**
   * Sorts a component's props into Props (required first), Events (`on…`), Text (`labels`,
   * the ARIA naming props) and Styling (folded); each group after the main one has
   * a subhead. A hook's parameters keep their order. @default false
   */
  grouped?: boolean;
}

/**
 * A list of props, one item per prop at every width (see {@link PropEntry}), as a named
 * region, so a screen reader can jump to it and hear how many props there are. A
 * `{@link Name}` in a description links to `Name`'s page. A Server Component; the
 * disclosures and the anchors' copy buttons are small client islands.
 */
export function PropsList({ caption, scope, props, grouped = false }: PropsListProps) {
  const items = propListItems(scope, props);
  const groups = grouped ? groupPropItems(items) : [];
  return (
    <section aria-label={caption} data-props-list="" className="@container flex flex-col gap-4">
      {groups.length > 1 ? (
        groups.map((group) => (
          <div key={group.id} data-prop-group={group.id} className="flex flex-col gap-1">
            {FOLDED_GROUPS.has(group.id) ? (
              <PropGroupFold label={group.label} count={group.items.length}>
                <PropItems items={group.items} />
              </PropGroupFold>
            ) : (
              <>
                {/* The main group sits under the component's heading; the rest are named. */}
                {group.id !== 'props' && (
                  <h4 className="text-label-large text-on-surface-variant">{group.label}</h4>
                )}
                <PropItems items={group.items} />
              </>
            )}
          </div>
        ))
      ) : (
        <PropItems items={groups[0]?.items ?? items} />
      )}
    </section>
  );
}

/** One component's props on a page. */
export interface ComponentPropsEntry {
  name: string;
  props: PropsRecord[];
  /** The elements whose HTML attributes the component also accepts (`button`, `a`). */
  htmlAttributes?: string[];
}

/** The id of a component's heading in the props section: `props-Dialog`. */
export function componentPropsId(name: string): string {
  return `props-${name}`;
}

function ComponentProps({ name, props, htmlAttributes }: ComponentPropsEntry) {
  const note = htmlAttributesNote(htmlAttributes);
  return (
    <div data-props-component={name} className="flex flex-col gap-4">
      <h3
        id={componentPropsId(name)}
        data-outline-label={name}
        className="flex flex-wrap items-baseline gap-x-3 scroll-mt-20"
      >
        <code dir="ltr" className={`${PLAIN_CODE} text-title-large text-on-surface`}>
          {name}
        </code>{' '}
        <span className="text-body-medium text-on-surface-variant">{propCount(props.length)}</span>
      </h3>
      {props.length > 0 && (
        <PropsList caption={`${name} props`} scope={name} props={props} grouped />
      )}
      {note && (
        <p data-props-note="" className="text-body-medium text-on-surface-variant">
          <InlineMarkdown text={note} />
        </p>
      )}
    </div>
  );
}

/**
 * A page's props: each component under its own heading (which the page outline lists), with
 * a filter field above them all once there are more than {@link FILTER_FROM} props.
 */
export function PropsReference({ components }: { components: readonly ComponentPropsEntry[] }) {
  const total = components.reduce((sum, { props }) => sum + props.length, 0);
  const sections = components.map((entry) => <ComponentProps key={entry.name} {...entry} />);
  return total > FILTER_FROM ? (
    <PropsFilter total={total}>{sections}</PropsFilter>
  ) : (
    <div className="flex flex-col gap-10">{sections}</div>
  );
}
