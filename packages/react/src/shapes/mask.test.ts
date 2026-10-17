import { describe, expect, it } from 'vitest';
import { cookie12SidedShape } from './generated/material-shape-paths';
import { materialShapeMask } from './mask';

describe('materialShapeMask', () => {
  it('draws the outline in a 1 × 1 SVG data URI', () => {
    const mask = materialShapeMask(cookie12SidedShape);
    expect(mask.startsWith('url("data:image/svg+xml,')).toBe(true);
    const svg = decodeURIComponent(mask.slice('url("data:image/svg+xml,'.length, -2));
    expect(svg).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" overflow="visible"><path d="${cookie12SidedShape.path}"/></svg>`,
    );
  });

  it('returns the same value for the same shape', () => {
    expect(materialShapeMask(cookie12SidedShape)).toBe(materialShapeMask(cookie12SidedShape));
  });

  it('takes a custom outline', () => {
    const mask = materialShapeMask({ name: 'Notch', path: 'M0 0H1V1L.5 .8 0 1Z' });
    expect(decodeURIComponent(mask)).toContain('<path d="M0 0H1V1L.5 .8 0 1Z"/>');
  });
});
