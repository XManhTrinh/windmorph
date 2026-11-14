/**
 * A consumer's `data-dragged` attribute as a state: present, and neither `false` nor
 * `"false"`. `ButtonBase` reads it this way for its dragged state layer, and so does a chip
 * whose container carries the attribute in its button's place.
 */
export const isDraggedAttribute = (value: unknown): boolean =>
  value !== undefined && value !== false && value !== 'false';
