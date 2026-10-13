import { render } from '@testing-library/react';
import { memo } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Menu, MenuGroup, MenuItem, MenuTrigger } from '../components/menu/Menu';
import { Button } from '../components/button/Button';
import { assertCollectionChildren } from './assert-collection-children';

// A server component's items reach the client with an object element type (a client
// reference); a memo component has an object type too, so it stands in for one here.
const ObjectTyped = memo(() => null);

describe('assertCollectionChildren', () => {
  it('accepts collection items, groups and plain values', () => {
    expect(() =>
      assertCollectionChildren(
        [
          <MenuItem key="a">A</MenuItem>,
          <MenuGroup key="g" title="G">
            <MenuItem key="b">B</MenuItem>
          </MenuGroup>,
          null,
          'text',
        ],
        'Menu',
        'MenuItem elements',
      ),
    ).not.toThrow();
  });

  it('names the server-component cause for object-typed items, also inside groups', () => {
    expect(() => assertCollectionChildren(<ObjectTyped />, 'Menu', 'MenuItem elements')).toThrow(
      /Menu: its MenuItem elements must be created in a client component/,
    );
    expect(() =>
      assertCollectionChildren(
        <MenuGroup title="G">
          <ObjectTyped />
        </MenuGroup>,
        'Menu',
        'MenuItem elements',
      ),
    ).toThrow(/client component/);
  });

  it('is what an open Menu reports instead of React Stately’s message', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <MenuTrigger defaultOpen>
          <Button>Edit</Button>
          <Menu aria-label="Edit">
            <ObjectTyped />
          </Menu>
        </MenuTrigger>,
      ),
    ).toThrow(
      /\[@windmorph\/react\] Menu: its MenuItem, MenuGroup and SubmenuTrigger elements must be created/,
    );
    error.mockRestore();
  });
});
