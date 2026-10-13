import { Button } from '@windmorph/react';
import { MenuBookIcon } from '../../components/icons';

/** With `href` the button renders an `<a>`, so it is a link that looks like a button. */
export function ButtonLink() {
  return (
    <Button
      href="https://m3.material.io/components/buttons"
      variant="text"
      leadingIcon={<MenuBookIcon />}
    >
      Read the spec
    </Button>
  );
}
