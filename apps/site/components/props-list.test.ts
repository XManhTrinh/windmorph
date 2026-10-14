import { describe, expect, it } from 'vitest';
import { propsTableRows } from './props-list';

describe('propsTableRows', () => {
  it("lists an object prop's keys right after it", () => {
    const rows = propsTableRows([
      { name: 'open', type: 'boolean', required: false, description: 'Controlled open state.' },
      {
        name: 'labels',
        type: 'Partial<SheetLabels>',
        required: false,
        description: 'Words the sheet announces.',
        keys: [
          {
            name: 'labels.close',
            type: 'string',
            required: false,
            defaultValue: '"Close"',
            description: 'The close button.',
          },
        ],
      },
    ]);
    expect(rows.map((row) => row.name)).toEqual(['open', 'labels', 'labels.close']);
    expect(rows[2]).toMatchObject({ defaultValue: '"Close"', description: 'The close button.' });
  });

  it('leaves the playground-only enum options out of the table', () => {
    const [row] = propsTableRows([
      { name: 'size', type: 'enum', required: false, options: ['sm', 'md'] },
    ]);
    expect(row).not.toHaveProperty('options');
  });
});
