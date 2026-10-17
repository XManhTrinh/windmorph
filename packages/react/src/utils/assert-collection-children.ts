import { Children, isValidElement, type ReactNode } from 'react';

/**
 * React Aria collections (menus, tabs, interactive lists) read their items' element types
 * directly. Items created in a React Server Component reach the client as client
 * references, not as the item component, and React Stately fails with "Unknown element
 * <[object Object]> in collection". This throws a message that names the cause instead.
 *
 * Development only; nested `MenuGroup`-style children are checked one level down unless
 * `nested` is false (a `Tab`'s children are its panel, which may come from the server).
 */
export function assertCollectionChildren(
  children: ReactNode,
  component: string,
  items: string,
  { nested = true }: { nested?: boolean } = {},
) {
  if (process.env.NODE_ENV === 'production') return;
  const check = (nodes: ReactNode, depth: number) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      if (typeof child.type === 'object' && child.type !== null) {
        throw new Error(
          `[@windmorph/react] ${component}: its ${items} must be created in a client component ` +
            `("use client"). Items created in a React Server Component arrive as client ` +
            `references, which React Aria collections can't read. Move the ${component} and ` +
            `its items into a client component, or render them from one.`,
        );
      }
      if (nested && depth === 0) check((child.props as { children?: ReactNode }).children, 1);
    });
  };
  check(children, 0);
}
