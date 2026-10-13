import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { List, ListItem, ListSection, type ListProps } from './List';

type Interaction = Pick<ListProps, 'onAction' | 'selectionMode' | 'variant'>;

function Settings(props: Interaction) {
  return (
    <List aria-label="Settings" data-testid="list" {...props}>
      <ListSection key="network" title="Network" className="custom-section">
        <ListItem key="wifi">Wi‑Fi</ListItem>
        <ListItem key="bluetooth">Bluetooth</ListItem>
      </ListSection>
      <ListSection key="display" title="Display">
        <ListItem key="brightness">Brightness</ListItem>
        <ListItem key="dark" disabled>
          Dark theme
        </ListItem>
        <ListItem key="font">Font size</ListItem>
      </ListSection>
      <ListSection key="more" aria-label="More">
        <ListItem key="about">About</ListItem>
      </ListSection>
    </List>
  );
}

describe('ListSection (static list)', () => {
  it('nests a list named by its subheader, with positions per section', async () => {
    const { container } = render(<Settings variant="segmented" />);
    const network = screen.getByRole('list', { name: 'Network' });
    const subheader = screen.getByText('Network');
    expect(subheader).toHaveClass(
      'min-h-[48px]',
      'ps-[16px]',
      'pe-[16px]',
      'text-title-small',
      'text-on-surface-variant',
    );
    expect(network.parentElement).toHaveClass('custom-section');
    expect(network).toHaveClass('gap-[2px]');
    const display = screen.getByRole('list', { name: 'Display' });
    const positions = (list: HTMLElement) =>
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.getAttribute('data-position'));
    expect(positions(network)).toEqual(['first', 'last']);
    expect(positions(display)).toEqual(['first', 'middle', 'last']);
    // A section without a subheader takes its name from aria-label, and stands apart.
    const more = screen.getByRole('list', { name: 'More' });
    expect(positions(more)).toEqual(['only']);
    expect(more.parentElement).toHaveClass('not-first:pt-[16px]');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('keeps loose items around sections in their own groups', () => {
    render(
      <List aria-label="Mixed" variant="segmented">
        <ListItem key="a">Alpha</ListItem>
        <ListItem key="b">Beta</ListItem>
        <ListSection key="s" title="Section">
          <ListItem key="c">Gamma</ListItem>
        </ListSection>
      </List>,
    );
    expect(screen.getByText('Alpha').closest('li')).toHaveAttribute('data-position', 'first');
    expect(screen.getByText('Beta').closest('li')).toHaveAttribute('data-position', 'last');
    expect(screen.getByText('Gamma').closest('li')).toHaveAttribute('data-position', 'only');
  });
});

describe('ListSection (grid list)', () => {
  it('is a row group with a header row, and arrow keys flow across sections', async () => {
    const onAction = vi.fn();
    const { container } = render(<Settings onAction={onAction} />);
    const grid = screen.getByRole('grid', { name: 'Settings' });
    const network = within(grid).getByRole('rowgroup', { name: 'Network' });
    expect(within(network).getByRole('rowheader')).toHaveTextContent('Network');
    expect(within(grid).getByRole('rowgroup', { name: 'More' })).toBeInTheDocument();
    await userEvent.tab();
    const row = (name: string) => screen.getByRole('row', { name });
    expect(row('Wi‑Fi')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    // From the last item of one section to the first of the next.
    expect(row('Brightness')).toHaveFocus();
    // The disabled item is skipped.
    await userEvent.keyboard('{ArrowDown}');
    expect(row('Font size')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(row('About')).toHaveFocus();
    // Wraps from the last item of the last section to the first of the first.
    await userEvent.keyboard('{ArrowDown}');
    expect(row('Wi‑Fi')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(row('About')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledWith('about');
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('ListSection (list box)', () => {
  it('is a group of options named by its subheader, and selects across sections', async () => {
    const { container } = render(<Settings selectionMode="multiple" />);
    const listbox = screen.getByRole('listbox', { name: 'Settings' });
    const display = within(listbox).getByRole('group', { name: 'Display' });
    expect(within(display).getAllByRole('option')).toHaveLength(3);
    expect(within(listbox).getByRole('group', { name: 'More' })).toBeInTheDocument();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const brightness = screen.getByRole('option', { name: 'Brightness' });
    expect(brightness).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(brightness).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Dark theme' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('ListSection (unsupported lists)', () => {
  it('refuses sections in radio lists and lists with childItems', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <List aria-label="Size" defaultValue="s">
          <ListSection key="all" title="All">
            <ListItem key="s" value="s">
              Small
            </ListItem>
          </ListSection>
        </List>,
      ),
    ).toThrow(/radio list can't hold ListSections/);
    expect(() =>
      render(
        <List aria-label="Files">
          <ListSection key="all" title="All">
            <ListItem key="docs" childItems={<ListItem key="cv">CV</ListItem>}>
              Documents
            </ListItem>
          </ListSection>
        </List>,
      ),
    ).toThrow(/childItems can't hold ListSections/);
    vi.restoreAllMocks();
  });

  it('requires a subheader or a name in its types', () => {
    // @ts-expect-error a title or an aria-label is required
    const unnamed = <ListSection>{[]}</ListSection>;
    expect(unnamed).toBeTruthy();
  });
});
