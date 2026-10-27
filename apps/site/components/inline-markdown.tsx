import { Fragment, type ReactNode } from 'react';
import { parseInlineMarkdown, type InlineNode } from '../lib/inline-markdown';
import { InlineCode } from './inline-code';

/** The page a code name (`Badge`, `useTheme`) is documented on, when there is one. */
export type ResolveCodeName = (name: string) => string | undefined;

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

function renderNodes(nodes: readonly InlineNode[], resolve?: ResolveCodeName): ReactNode[] {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case 'text':
        return <Fragment key={index}>{node.text}</Fragment>;
      case 'code':
        return (
          <InlineCode key={index} dir="ltr">
            {node.text}
          </InlineCode>
        );
      case 'ref': {
        const code = (
          <InlineCode key={node.label ? undefined : index} dir="ltr">
            {node.name}
          </InlineCode>
        );
        const content = node.label ?? code;
        const href = resolve?.(node.name);
        return href ? (
          <a key={index} href={href} className={LINK}>
            {content}
          </a>
        ) : (
          <Fragment key={index}>{content}</Fragment>
        );
      }
      case 'link':
        return (
          <a key={index} href={node.href} className={LINK}>
            {renderNodes(node.children, resolve)}
          </a>
        );
      case 'strong':
        return (
          <strong key={index} className="text-on-surface">
            {renderNodes(node.children, resolve)}
          </strong>
        );
      case 'em':
        return <em key={index}>{renderNodes(node.children, resolve)}</em>;
    }
  });
}

/**
 * One paragraph of the library's JSDoc Markdown (code spans, `{@link}` references, links,
 * strong and emphasis) as inline content. A reference links to its page when `resolve` knows
 * it. A Server Component.
 */
export function InlineMarkdown({ text, resolve }: { text: string; resolve?: ResolveCodeName }) {
  return renderNodes(parseInlineMarkdown(text), resolve);
}
