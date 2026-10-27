import axe from 'axe-core';
import { vi } from 'vitest';

/**
 * Runs axe's `label-content-name-mismatch` rule (WCAG 2.5.3 Label in Name; experimental, so
 * `axeViolations` leaves it out) and returns its violations. The rule only weighs text it
 * can see, and jsdom lays nothing out, so for the run every element gets a 200 × 20 box and
 * the canvas axe uses to tell icon ligatures from words measures every character 10px wide
 * and paints it solid, which reads every text as words.
 */
export async function labelInNameViolations(container: Element) {
  const box = { x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 20, width: 200, height: 20 };
  const rect = { ...box, toJSON: () => box } as DOMRect;
  const canvas = {
    canvas: { width: 0, height: 0 },
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    measureText: (text: string) => ({ width: text.length * 10 }),
    fillText: () => {},
    clearRect: () => {},
    getImageData: (_x: number, _y: number, width: number, height: number) => ({
      data: new Uint8ClampedArray(Math.max(1, Math.ceil(width * height)) * 4).fill(255),
    }),
  };
  const spies = [
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(rect),
    vi
      .spyOn(Element.prototype, 'getClientRects')
      .mockReturnValue(Object.assign([rect], { item: () => rect }) as unknown as DOMRectList),
    vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(canvas as unknown as CanvasRenderingContext2D),
  ];
  try {
    const results = await axe.run(container, { runOnly: ['label-content-name-mismatch'] });
    return results.violations.flatMap((violation) =>
      violation.nodes.map((node) => ({ id: violation.id, target: node.target.join(' ') })),
    );
  } finally {
    for (const spy of spies) spy.mockRestore();
  }
}
