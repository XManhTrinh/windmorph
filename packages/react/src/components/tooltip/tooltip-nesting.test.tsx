import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Button } from '../button/Button';
import { Dialog, DialogContent, DialogTrigger } from '../dialog/Dialog';
import { FabMenu, FabMenuItem } from '../fab-menu/FabMenu';
import { IconButton } from '../icon-button/IconButton';
import { Menu, MenuItem, MenuTrigger } from '../menu/Menu';
import { BottomSheet } from '../sheet/BottomSheet';
import { SheetTrigger } from '../sheet/SheetTrigger';
import { RichTooltip, RichTooltipTrigger, Tooltip, TooltipTrigger } from './Tooltip';

// Triggers pass props to their button through TriggerContext; nested triggers must merge
// them, so a tooltip still works on a button that opens a menu, dialog or sheet.

const Icon = () => <svg viewBox="0 0 24 24" />;

/** React Aria counts a hover only once a pointer move has set the interaction modality. */
async function hover(element: Element) {
  fireEvent.pointerMove(document.body);
  await userEvent.hover(element);
}

const gone = (role: string) =>
  waitFor(() => expect(screen.queryByRole(role)).toBeNull(), { timeout: 1500 });

function MoreMenu({ onAction }: { onAction?: (key: string) => void }) {
  return (
    <Menu aria-label="More" onAction={(key) => onAction?.(String(key))}>
      <MenuItem key="edit">Edit</MenuItem>
      <MenuItem key="delete">Delete</MenuItem>
    </Menu>
  );
}

/** `hidden`: while the menu is open, React Aria hides the rest of the page, button included. */
const more = () => screen.getByRole('button', { name: 'More', hidden: true });

/** Hovering shows the tooltip, which describes the button. */
async function expectHoverTooltip(trigger: HTMLElement, text: string) {
  await hover(trigger);
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toHaveTextContent(text);
  expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  await userEvent.unhover(trigger);
  await gone('tooltip');
}

describe('a TooltipTrigger around a MenuTrigger', () => {
  function TooltipMenu({ onAction }: { onAction?: (key: string) => void }) {
    return (
      <TooltipTrigger>
        <MenuTrigger>
          <IconButton icon={<Icon />} aria-label="More" />
          <MoreMenu onAction={onAction} />
        </MenuTrigger>
        <Tooltip>More options</Tooltip>
      </TooltipTrigger>
    );
  }

  it('shows the tooltip on hover, describing the menu button, with no axe violations', async () => {
    const { container } = render(<TooltipMenu />);
    expect(more()).toHaveAttribute('aria-haspopup', 'true');
    await hover(more());
    expect(await screen.findByRole('tooltip')).toHaveTextContent('More options');
    expect(more()).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows the tooltip on keyboard focus', async () => {
    render(<TooltipMenu />);
    await userEvent.tab();
    expect(more()).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('More options');
  });

  it('opens the menu on press and hides the tooltip', async () => {
    const onAction = vi.fn();
    render(<TooltipMenu onAction={onAction} />);
    await hover(more());
    await screen.findByRole('tooltip');
    await userEvent.click(more());
    const menu = screen.getByRole('menu', { name: 'More' });
    expect(more()).toHaveAttribute('aria-expanded', 'true');
    await gone('tooltip');
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Delete' }));
    expect(onAction).toHaveBeenCalledWith('delete');
  });

  it('opens the menu with Enter, then Escape closes it and returns focus', async () => {
    render(<TooltipMenu />);
    await userEvent.tab();
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await gone('tooltip');
    await userEvent.keyboard('{Escape}');
    await gone('menu');
    await waitFor(() => expect(more()).toHaveFocus());
    // Back on the button with the keyboard, the tooltip shows again; Escape hides it.
    expect(await screen.findByRole('tooltip')).toHaveTextContent('More options');
    await userEvent.keyboard('{Escape}');
    await gone('tooltip');
  });

  it('opens the menu with ArrowDown', async () => {
    render(<TooltipMenu />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await gone('tooltip');
  });

  it('keeps the button’s own ref', async () => {
    let element: HTMLButtonElement | null = null;
    render(
      <TooltipTrigger>
        <MenuTrigger>
          <IconButton
            ref={(node) => {
              element = node;
            }}
            icon={<Icon />}
            aria-label="More"
          />
          <MoreMenu />
        </MenuTrigger>
        <Tooltip>More options</Tooltip>
      </TooltipTrigger>,
    );
    expect(element).toBe(more());
    // The menu still anchors to the button (its trigger ref is set too).
    await userEvent.click(more());
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});

describe('a MenuTrigger around a TooltipTrigger', () => {
  it('shows the tooltip and opens the menu', async () => {
    render(
      <MenuTrigger>
        <TooltipTrigger>
          <IconButton icon={<Icon />} aria-label="More" />
          <Tooltip>More options</Tooltip>
        </TooltipTrigger>
        <MoreMenu />
      </MenuTrigger>,
    );
    await expectHoverTooltip(more(), 'More options');
    await userEvent.click(more());
    expect(screen.getByRole('menu', { name: 'More' })).toBeInTheDocument();
  });
});

describe('a TooltipTrigger around other triggers', () => {
  const cases: [string, (button: ReactElement) => ReactElement, string][] = [
    [
      'DialogTrigger',
      (button) => (
        <DialogTrigger>
          {button}
          <Dialog aria-label="About">
            <DialogContent>Version 1</DialogContent>
          </Dialog>
        </DialogTrigger>
      ),
      'dialog',
    ],
    [
      'SheetTrigger',
      (button) => (
        <SheetTrigger>
          {button}
          <BottomSheet aria-label="About">
            <p>Version 1</p>
          </BottomSheet>
        </SheetTrigger>
      ),
      'dialog',
    ],
    [
      'RichTooltipTrigger',
      (button) => (
        <RichTooltipTrigger>
          {button}
          <RichTooltip title="About">Version 1</RichTooltip>
        </RichTooltipTrigger>
      ),
      'dialog',
    ],
  ];

  it.each(cases)('%s: shows the tooltip, then opens and hides it', async (_, wrap, role) => {
    render(
      <TooltipTrigger>
        {wrap(<IconButton icon={<Icon />} aria-label="Info" />)}
        <Tooltip>About this app</Tooltip>
      </TooltipTrigger>,
    );
    const info = screen.getByRole('button', { name: 'Info' });
    await expectHoverTooltip(info, 'About this app');
    await userEvent.tab();
    expect(info).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('About this app');
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole(role)).toBeInTheDocument();
    expect(info).toHaveAttribute('aria-expanded', 'true');
    await gone('tooltip');
  });
});

describe('a TooltipTrigger around a FabMenu', () => {
  it('describes the FAB only, not its items', async () => {
    render(
      <TooltipTrigger>
        <FabMenu icon={<Icon />} aria-label="Create">
          <FabMenuItem icon={<Icon />}>Reply</FabMenuItem>
        </FabMenu>
        <Tooltip>Create a post</Tooltip>
      </TooltipTrigger>,
    );
    const fab = screen.getByRole('button', { name: 'Create' });
    await expectHoverTooltip(fab, 'Create a post');
    await userEvent.click(fab);
    expect(fab).toHaveAttribute('aria-expanded', 'true');
    await gone('tooltip');
    const reply = await screen.findByRole('button', { name: 'Reply' });
    await hover(reply);
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(reply).not.toHaveAttribute('aria-describedby');
  });
});

describe('a plain trigger', () => {
  it('is unchanged without an enclosing trigger', async () => {
    render(
      <MenuTrigger>
        <Button>Open</Button>
        <MoreMenu />
      </MenuTrigger>,
    );
    const open = screen.getByRole('button', { name: 'Open' });
    expect(open).not.toHaveAttribute('aria-describedby');
    await userEvent.click(open);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
