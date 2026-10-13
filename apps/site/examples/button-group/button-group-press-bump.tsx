import { Button, ButtonGroup } from '@windmorph/react';

/**
 * By default a connected group only changes the pressed button's shape, as the M3 spec asks.
 * `expandedRatio` opts it into the standard group's press bump (the pressed button grows and
 * its neighbours give way), the motion Google's Expressive showcase plays on connected groups.
 */
export function ButtonGroupPressBump() {
  return (
    <ButtonGroup
      variant="connected"
      buttonVariant="tonal"
      expandedRatio={0.15}
      aria-label="Playback"
      className="max-w-md"
    >
      <Button>Rewind</Button>
      <Button>Play</Button>
      <Button>Forward</Button>
    </ButtonGroup>
  );
}
