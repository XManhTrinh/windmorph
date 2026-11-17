/**
 * `values` read at `length` places spread over the same span, by straight-line interpolation:
 * a list of another length takes the old one's shape (7 points read at 84 places). An empty
 * list reads as `rest`.
 */
export function resample(values: readonly number[], length: number, rest = 0): number[] {
  const count = values.length;
  if (length <= 0) return [];
  if (count === 0) return new Array<number>(length).fill(rest);
  if (count === 1) return new Array<number>(length).fill(values[0]!);
  return Array.from({ length }, (_, index) => {
    const at = length === 1 ? count - 1 : (index * (count - 1)) / (length - 1);
    const below = Math.floor(at);
    const above = Math.min(count - 1, below + 1);
    const share = at - below;
    return values[below]! + (values[above]! - values[below]!) * share;
  });
}
