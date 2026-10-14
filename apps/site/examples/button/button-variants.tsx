import { Button } from '@windmorph/react';

/** The five button variants, in M3's order: filled has the highest emphasis, text the lowest. */
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
