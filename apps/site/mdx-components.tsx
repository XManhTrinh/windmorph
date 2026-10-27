import { CodeBlock } from '@windmorph/react-pro';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';

/**
 * Maps plain MDX elements to the library's type scale and semantic colour roles (semantic
 * tokens only — "only our components"), and fenced code blocks to `CodeBlock`. The `pre`
 * override reads the data attributes set by the build-time rehype plugin
 * (`lib/rehype-code-block.ts`). In this phase the map exists and is exercised by the
 * home-page quick-start snippet; no guide `.mdx` files are authored yet.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (p) => <h1 className="text-display-small text-on-surface" {...p} />,
    h2: (p) => <h2 className="text-headline-large text-on-surface" {...p} />,
    h3: (p) => <h3 className="text-headline-small text-on-surface" {...p} />,
    h4: (p) => <h4 className="text-title-large text-on-surface" {...p} />,
    p: (p) => <p className="text-body-large text-on-surface-variant" {...p} />,
    ul: (p) => <ul className="list-disc ps-6 text-body-large text-on-surface-variant" {...p} />,
    ol: (p) => <ol className="list-decimal ps-6 text-body-large text-on-surface-variant" {...p} />,
    li: (p) => <li className="my-1" {...p} />,
    a: (p) => <a className="text-primary underline" {...p} />,
    table: (p) => <table className="w-full border-collapse text-body-medium" {...p} />,
    th: (p) => (
      <th className="border-b border-outline-variant p-2 text-start text-title-small" {...p} />
    ),
    td: (p) => (
      <td className="border-b border-outline-variant p-2 text-on-surface-variant" {...p} />
    ),
    code: (p) => (
      <code
        className="rounded-corner-extra-small bg-surface-container px-1 text-on-surface"
        {...p}
      />
    ),
    pre: PreToCodeBlock,
    ...components,
  };
}

type PreProps = ComponentProps<'pre'> & {
  'data-raw'?: string;
  'data-lang'?: string;
  'data-title'?: string;
  'data-html'?: string;
  'data-show-line-numbers'?: string;
};

/** Renders a fenced code block (annotated by the rehype plugin) as a `CodeBlock`. */
function PreToCodeBlock(props: ComponentProps<'pre'>) {
  const { children, ...rest } = props as PreProps;
  if (rest['data-html'] != null) {
    return (
      <CodeBlock
        code={decodeURIComponent(rest['data-raw'] ?? '')}
        html={decodeURIComponent(rest['data-html'])}
        lang={rest['data-lang']}
        title={rest['data-title']}
        lineNumbers={rest['data-show-line-numbers'] != null}
      />
    );
  }
  return <pre {...rest}>{children}</pre>;
}
