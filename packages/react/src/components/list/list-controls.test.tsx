import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '../checkbox/Checkbox';
import { RadioGroup, Radio } from '../radio/RadioGroup';
import { Switch } from '../switch/Switch';
import { thumbGeometry } from '../switch/switch-thumb';
import { List, ListItem } from './List';

/** A drawn part of a control (its box, ring or thumb), found from its input's label. */
function drawn(input: HTMLElement, find: (label: HTMLElement) => Element | null | undefined) {
  return find(input.closest('label') as HTMLElement)?.outerHTML;
}

const box = (label: HTMLElement) => label.querySelector('svg')?.parentElement;
const ring = (label: HTMLElement) => label.querySelector('.scale-0')?.parentElement;
const thumb = (label: HTMLElement) => label.querySelector('[class*="size-[var(--m3-thumb-size)]"]');

describe('List controls', () => {
  it('draw the same box, ring and thumb as the standalone controls', () => {
    render(
      <>
        <Checkbox aria-label="Alone" />
        <RadioGroup aria-label="Alone group">
          <Radio value="alone">Alone radio</Radio>
        </RadioGroup>
        <Switch aria-label="Alone switch" />
        <List aria-label="Options">
          <ListItem key="c" control="checkbox">
            In a list
          </ListItem>
          <ListItem key="s" control="switch">
            In a switch list
          </ListItem>
        </List>
        <List aria-label="Choices" defaultValue="other">
          <ListItem key="r" value="r">
            In a radio list
          </ListItem>
        </List>
      </>,
    );
    const pairs = [
      ['checkbox', 'In a list', 'Alone', box],
      ['radio', 'In a radio list', 'Alone radio', ring],
      ['switch', 'In a switch list', 'Alone switch', thumb],
    ] as const;
    for (const [role, inList, alone, find] of pairs) {
      const listed = drawn(screen.getByRole(role, { name: inList }), find);
      expect(listed).toMatch(/^<span/);
      expect(listed).toBe(drawn(screen.getByRole(role, { name: alone }), find));
    }
  });

  it("size the switch thumb as Compose's ThumbNode", () => {
    expect(thumbGeometry(false, false, false)).toEqual({ size: 16, center: 16 });
    expect(thumbGeometry(false, false, true)).toEqual({ size: 24, center: 16 });
    expect(thumbGeometry(true, false, false)).toEqual({ size: 24, center: 36 });
    expect(thumbGeometry(true, true, false)).toEqual({ size: 28, center: 36 });
  });
});
