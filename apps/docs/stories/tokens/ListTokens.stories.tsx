import type { Meta, StoryObj } from '@storybook/react-vite';
import { List, ListItem, type ListVariant } from '@windmorph/react';
import { SendIcon, StarIcon } from '../icons';
import { TokenProbe } from './probe';

const VARIANTS: ListVariant[] = ['standard', 'segmented'];

/** A selectable list whose second item is selected, so the first shows the resting colours. */
function Sample({ variant, itemClassName }: { variant: ListVariant; itemClassName?: string }) {
  return (
    <List
      aria-label={`${variant} list`}
      variant={variant}
      selectionMode="single"
      defaultSelectedKeys={['sam']}
      className="w-80"
      {...(itemClassName && { classNames: { item: itemClassName } })}
    >
      <ListItem
        key="alex"
        overline="Team"
        supportingText="Design review at 3pm"
        leading={<StarIcon />}
        trailing="9:41"
      >
        Alex
      </ListItem>
      <ListItem key="sam" supportingText="Sent the slides" leading={<SendIcon />} trailing="8:02">
        Sam
      </ListItem>
    </List>
  );
}

/** The list's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-list',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={VARIANTS.map((variant) => (
        <Sample key={variant} variant={variant} />
      ))}
      scoped={<Sample variant="standard" />}
      override={{
        token: '--md-comp-list-list-item-container-color',
        children: <Sample variant="standard" itemClassName="bg-tertiary" />,
      }}
    />
  ),
};
