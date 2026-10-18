import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { List, ListItem } from './List';
import { ListItemAvatar, ListItemImage, ListItemVideo } from './ListMedia';

const Icon = () => <svg data-testid="fallback" viewBox="0 0 24 24" />;

describe('ListItemImage', () => {
  it("is M3's 56dp square with 8dp corners, cropped to fill, loading lazily", () => {
    render(
      <List aria-label="Saved">
        <ListItem
          key="a"
          leading={
            <ListItemImage
              src="/a.jpg"
              srcSet="/a.jpg 1x, /a@2x.jpg 2x"
              sizes="56px"
              alt="A bowl of soup"
            />
          }
        >
          Soup
        </ListItem>
      </List>,
    );
    const image = screen.getByRole('img', { name: 'A bowl of soup' });
    expect(image).toHaveAttribute('src', '/a.jpg');
    expect(image).toHaveAttribute('srcset', '/a.jpg 1x, /a@2x.jpg 2x');
    expect(image).toHaveAttribute('sizes', '56px');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image.parentElement).toHaveClass(
      'size-[56px]',
      'rounded-corner-small',
      '[&>img]:object-cover',
      'group-data-disabled/list-item:opacity-38',
    );
  });

  it('shows its fallback with no src, and when the image fails to load', () => {
    const { rerender } = render(
      <List aria-label="Saved">
        <ListItem key="a" leading={<ListItemImage alt="" fallback={<Icon />} />}>
          A note
        </ListItem>
      </List>,
    );
    expect(screen.getByTestId('fallback').parentElement).toHaveClass('bg-secondary-container');

    rerender(
      <List aria-label="Saved">
        <ListItem key="a" leading={<ListItemImage src="/gone.jpg" alt="" fallback={<Icon />} />}>
          A note
        </ListItem>
      </List>,
    );
    expect(screen.queryByTestId('fallback')).toBeNull();
    fireEvent.error(document.querySelector('img')!);
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();

    // A new image gets its own chance to load.
    rerender(
      <List aria-label="Saved">
        <ListItem key="a" leading={<ListItemImage src="/new.jpg" alt="" fallback={<Icon />} />}>
          A note
        </ListItem>
      </List>,
    );
    expect(document.querySelector('img')).toHaveAttribute('src', '/new.jpg');
  });

  it("frames the app's own image, and takes the list's media classes and its own", () => {
    render(
      <List aria-label="Saved" classNames={{ media: 'rounded-corner-medium' }}>
        <ListItem
          key="a"
          leading={
            <ListItemImage alt="" className="ring-1">
              <img src="/framework.jpg" alt="" data-testid="own" />
            </ListItemImage>
          }
        >
          Soup
        </ListItem>
      </List>,
    );
    const frame = screen.getByTestId('own').parentElement;
    expect(frame).toHaveClass('size-[56px]', 'rounded-corner-medium', 'ring-1');
    expect(frame).not.toHaveClass('rounded-corner-small');
  });
});

describe('ListItemVideo', () => {
  it("is M3's 100 × 56 or 114 × 64dp thumbnail, with its length and a play badge", () => {
    const { rerender } = render(
      <List aria-label="Videos">
        <ListItem key="a" leading={<ListItemVideo src="/t.jpg" alt="" duration="2:41" />}>
          How to make pancakes
        </ListItem>
      </List>,
    );
    const frame = document.querySelector('img')!.parentElement!;
    expect(frame).toHaveClass('w-[100px]', 'h-[56px]', 'rounded-corner-small');
    expect(screen.getByText('2:41')).toBeInTheDocument();
    expect(frame.querySelector('[aria-hidden="true"] svg')).not.toBeNull();

    rerender(
      <List aria-label="Videos">
        <ListItem key="a" leading={<ListItemVideo src="/t.jpg" alt="" size="lg" />}>
          How to make pancakes
        </ListItem>
      </List>,
    );
    expect(document.querySelector('img')!.parentElement).toHaveClass('w-[114px]', 'h-[64px]');
    expect(screen.queryByText('2:41')).toBeNull();
  });
});

describe('ListItemAvatar', () => {
  it("is M3's 40dp primary-container circle, with a photo or initials", async () => {
    const { container } = render(
      <List aria-label="People">
        <ListItem key="a" leading={<ListItemAvatar>AL</ListItemAvatar>}>
          Alex Lee
        </ListItem>
        <ListItem key="b" leading={<ListItemAvatar src="/sam.jpg">SK</ListItemAvatar>}>
          Sam Kim
        </ListItem>
      </List>,
    );
    const initials = screen.getByText('AL');
    expect(initials).toHaveAttribute('aria-hidden', 'true');
    expect(initials.parentElement).toHaveClass(
      'size-[40px]',
      'rounded-full',
      'bg-primary-container',
      'text-on-primary-container',
      'text-title-medium',
    );
    const photo = document.querySelector('img')!;
    expect(photo).toHaveAttribute('alt', '');
    expect(screen.queryByText('SK')).toBeNull();
    fireEvent.error(photo);
    expect(screen.getByText('SK')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('List (media, line limits and dividers)', () => {
  it('aligns a three-line item with media to the top, and fades media when disabled', () => {
    render(
      <List aria-label="Saved" onAction={() => {}}>
        <ListItem
          key="a"
          overline="Recipe"
          supportingText="Saved yesterday"
          leading={<ListItemImage src="/a.jpg" alt="" />}
          disabled
        >
          Soup
        </ListItem>
      </List>,
    );
    const row = screen.getByRole('row');
    expect(row).toHaveClass('items-start');
    expect(row).toHaveAttribute('data-disabled', 'true');
  });

  it('limits lines from the list, overridden by an item, keeping the full text', () => {
    const long = 'A very long headline that goes on and on past where the item would end';
    render(
      <List aria-label="Notes" headlineLines={1} supportingTextLines={2}>
        <ListItem key="a" supportingText="Details">
          {long}
        </ListItem>
        <ListItem key="b" headlineLines={2}>
          Second
        </ListItem>
      </List>,
    );
    const [first, second] = screen.getAllByRole('listitem') as [HTMLElement, HTMLElement];
    expect(screen.getByText(long)).toHaveClass('line-clamp-1');
    expect(screen.getByText('Details')).toHaveClass('line-clamp-2');
    expect(first).toHaveTextContent(long);
    expect(screen.getByText('Second')).toHaveClass('line-clamp-2');
    expect(second).toBeInTheDocument();
  });

  it('applies line limits to link items too, with the full text as the link name', () => {
    const long = 'A long title for a link that would wrap onto many lines in a narrow list';
    render(
      <List aria-label="Pages" headlineLines={1}>
        <ListItem key="a" href="/a">
          {long}
        </ListItem>
      </List>,
    );
    expect(screen.getByRole('link', { name: long }).parentElement).toHaveClass('line-clamp-1');
  });

  it('has no line limits by default', () => {
    render(
      <List aria-label="Notes">
        <ListItem key="a" supportingText="Details">
          Title
        </ListItem>
      </List>,
    );
    expect(screen.getByText('Title').className).not.toMatch(/line-clamp/);
    expect(screen.getByText('Details').className).not.toMatch(/line-clamp/);
  });

  it('draws full or inset dividers between items, never under the last', () => {
    const { rerender } = render(
      <List aria-label="Settings" dividers="full">
        <ListItem key="a">One</ListItem>
        <ListItem key="b">Two</ListItem>
      </List>,
    );
    const [first, last] = screen.getAllByRole('listitem') as [HTMLElement, HTMLElement];
    expect(first).toHaveClass('relative', 'after:inset-x-0', 'after:bg-outline-variant');
    expect(first).toHaveAttribute('data-position', 'first');
    expect(last).toHaveClass('data-[position=last]:after:hidden');
    expect(screen.getByRole('list').querySelectorAll('hr, [role="separator"]')).toHaveLength(0);

    rerender(
      <List aria-label="Settings" dividers="inset" onAction={() => {}}>
        <ListItem key="a">One</ListItem>
        <ListItem key="b">Two</ListItem>
      </List>,
    );
    expect(screen.getAllByRole('row')[0]).toHaveClass('after:inset-x-[16px]');
  });

  it('refuses dividers in a segmented list', () => {
    expect(() =>
      render(
        <List aria-label="Settings" variant="segmented" dividers="full">
          <ListItem key="a">One</ListItem>
        </List>,
      ),
    ).toThrow(/dividers are for standard lists/);
  });

  it('passes axe with images, fallbacks, video, line limits and dividers', async () => {
    const { container } = render(
      <List aria-label="Library" dividers="inset" headlineLines={2} supportingTextLines={1}>
        <ListItem key="a" leading={<ListItemImage src="/a.jpg" alt="" />} supportingText="Saved">
          Soup
        </ListItem>
        <ListItem key="b" leading={<ListItemImage alt="" fallback={<Icon />} />}>
          A note
        </ListItem>
        <ListItem key="c" leading={<ListItemVideo src="/t.jpg" alt="" duration="2:41" />}>
          How to make pancakes
        </ListItem>
      </List>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
