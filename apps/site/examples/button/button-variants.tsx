import { Button } from '@windmorph/react';

/** The five button variants, from highest to lowest emphasis. */
export function ButtonVariants() {
  return (
    <>
      <Button variant="elevated">Elevated</Button>
      <Button variant="filled">Filled</Button>
      <Button variant="tonal">Tonal</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
    </>
  );
}
