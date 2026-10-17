import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeScope } from '../../theme/ThemeScope';
import { ButtonGroup } from '../../composites/button-group/ButtonGroup';
import { TopAppBar } from '../app-bar/TopAppBar';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../dialog/Dialog';
import { NavigationRail, NavigationRailItem } from '../navigation/NavigationRail';
import { SearchAppBar } from '../search/SearchAppBar';
import { SearchBar } from '../search/SearchBar';
import { SideSheet } from '../sheet/SideSheet';
import { Snackbar } from '../snackbar/Snackbar';
import { SheetTrigger } from '../sheet/SheetTrigger';
import { DockedToolbar, FloatingToolbar } from '../toolbar/Toolbar';
import { IconButton } from './IconButton';

const Icon = () => <svg viewBox="0 0 24 24" />;
const icon = (label: string) => <IconButton icon={<Icon />} aria-label={label} />;
const button = (name: string) => screen.getByRole('button', { name });

/**
 * Icon buttons in parts that keep their own size at every density stay at density 0 (their
 * `data-density` sets `--md-sys-density` for them), while a standalone icon button takes the
 * scope's density, and an icon button's own `density` always wins. The browser suite
 * (`density.spec.ts`) measures the sizes.
 */
describe('icon buttons in parts that keep their size', () => {
  it('stay at density 0 in app bars, toolbars, search bars and a rail header', () => {
    render(
      <ThemeScope density={-3}>
        {icon('Standalone')}
        <TopAppBar title="Inbox" navigationIcon={icon('Menu')} actions={icon('Account')} />
        <SearchAppBar navigationIcon={icon('Back')}>
          <SearchBar aria-label="Search" trailingIcon={icon('Voice search')} />
        </SearchAppBar>
        <DockedToolbar aria-label="Docked">
          {icon('Archive')}
          <IconButton icon={<Icon />} aria-label="Own density" density={-2} />
        </DockedToolbar>
        <FloatingToolbar aria-label="Floating">
          <ButtonGroup aria-label="Format">
            {icon('Bold')}
            {icon('Italic')}
          </ButtonGroup>
        </FloatingToolbar>
        <NavigationRail aria-label="Main" header={icon('Open menu')}>
          <NavigationRailItem id="home" icon={<Icon />}>
            Home
          </NavigationRailItem>
        </NavigationRail>
      </ThemeScope>,
    );
    expect(button('Standalone')).not.toHaveAttribute('data-density');
    for (const name of [
      'Menu',
      'Account',
      'Back',
      'Voice search',
      'Archive',
      'Bold',
      'Italic',
      'Open menu',
    ]) {
      expect(button(name), name).toHaveAttribute('data-density', '0');
    }
    expect(button('Own density')).toHaveAttribute('data-density', '-2');
  });

  it('stay at density 0 in a full-screen dialog header and sheet headers', () => {
    render(
      <ThemeScope density={-3}>
        <DialogTrigger defaultOpen>
          {icon('Edit')}
          <Dialog fullScreen="always">
            <DialogHeader labels={{ close: 'Close dialog' }} action={icon('Save')}>
              Edit name
            </DialogHeader>
            <DialogContent>Name</DialogContent>
          </Dialog>
        </DialogTrigger>
      </ThemeScope>,
    );
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Close dialog' })).toHaveAttribute(
      'data-density',
      '0',
    );
    expect(within(dialog).getByRole('button', { name: 'Save' })).toHaveAttribute(
      'data-density',
      '0',
    );
  });

  it('stay at density 0 in a side sheet header', () => {
    render(
      <ThemeScope density={-3}>
        <SheetTrigger defaultOpen>
          {icon('Filters')}
          <SideSheet title="Filters" onBack={() => {}} actions={icon('Reset')}>
            Options
          </SideSheet>
        </SheetTrigger>
      </ThemeScope>,
    );
    const side = screen.getByRole('dialog', { name: 'Filters' });
    for (const name of ['Back', 'Reset', 'Close']) {
      expect(within(side).getByRole('button', { name }), name).toHaveAttribute('data-density', '0');
    }
  });

  it("stay at density 0 in a snackbar's 48px row", () => {
    render(
      <ThemeScope density={-3}>
        <Snackbar actionLabel="Undo" onDismiss={() => {}}>
          Message archived
        </Snackbar>
      </ThemeScope>,
    );
    expect(button('Dismiss')).toHaveAttribute('data-density', '0');
  });
});
