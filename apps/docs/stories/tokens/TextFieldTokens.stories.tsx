import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField, type TextFieldProps } from '@windmorph/react';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { SearchIcon, StarIcon } from '../icons';
import { TokenProbe } from './probe';

/** The text field's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-text-field',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

const Field = (props: Partial<TextFieldProps>) => (
  <TextField
    label="City"
    defaultValue="Lyon"
    supportingText="Where you live"
    leadingIcon={<SearchIcon />}
    trailingIcon={<StarIcon />}
    {...(props as object)}
  />
);

/**
 * Shows the field inside it as focused or hovered, as computed-styles.spec forces states:
 * only one element can hold focus, and the probe needs a focused field of each variant.
 */
function Forced({ state, children }: { state: 'focus' | 'hover'; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const field = ref.current?.querySelector('[data-field-state]');
    field?.setAttribute('data-field-state', state);
    field?.setAttribute(state === 'focus' ? 'data-focused' : 'data-hovered', 'true');
  }, [state]);
  return <div ref={ref}>{children}</div>;
}

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          <Field variant="filled" />
          <Field variant="outlined" />
          <Forced state="focus">
            <Field variant="filled" label="Focused" />
          </Forced>
          <Forced state="focus">
            <Field variant="outlined" label="Focused" />
          </Forced>
          <Forced state="hover">
            <Field variant="outlined" label="Hovered" />
          </Forced>
        </>
      }
      scoped={<Field variant="filled" label="Scoped" />}
      override={{
        token: '--md-comp-filled-text-field-container-color',
        children: (
          <Field
            variant="filled"
            label="Override"
            classNames={{ container: 'bg-tertiary-container' }}
          />
        ),
      }}
    />
  ),
};
