import { Button } from '@windmorph/react';
import { SendIcon } from '../../components/icons';

/** The five sizes (XS–XL). Round is the default; `shape="square"` squares the corners. */
export function ButtonSizes() {
  return (
    <>
      <Button size="xs" leadingIcon={<SendIcon />}>
        XS
      </Button>
      <Button size="sm" leadingIcon={<SendIcon />}>
        SM
      </Button>
      <Button size="md" leadingIcon={<SendIcon />}>
        MD
      </Button>
      <Button size="lg" shape="square" leadingIcon={<SendIcon />}>
        LG
      </Button>
      <Button size="xl" shape="square" leadingIcon={<SendIcon />}>
        XL
      </Button>
    </>
  );
}
