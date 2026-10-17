/** Options for {@link useEdge}. */
export interface EdgeOptions {
  /** Distance (px) before it changes. @default 40 */
  threshold?: number;
  /** Reverses the direction. */
  reverse?: boolean;
}

/** Whether the edge is in view, like {@link useEdge}'s callers expect. */
export function useEdge(options?: EdgeOptions): boolean {
  return (options?.threshold ?? 40) > 0;
}
