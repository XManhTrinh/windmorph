import { Button, ButtonGroup } from '@windmorph/react';

/**
 * By default a connected group only changes the pressed button's shape, as the M3 spec asks.
 * `expandedRatio` opts it into the standard group's press bump (the pressed button grows and
 * its neighbours give way), the motion Google's Expressive showcase plays on connected groups.
 * A connected group is for selection, so its buttons are toggles with a value.
 */
export function ButtonGroupPressBump() {
  return (
    <ButtonGroup
      variant="connected"
      buttonVariant="tonal"
      expandedRatio={0.15}
      selectionMode="single"
      defaultSelectedKeys={['normal']}
      disallowEmptySelection
      aria-label="Playback speed"
      className="max-w-md"
    >
      <Button toggle value="slow">
        Slow
      </Button>
      <Button toggle value="normal">
        Normal
      </Button>
      <Button toggle value="fast">
        Fast
      </Button>
    </ButtonGroup>
  );
}
