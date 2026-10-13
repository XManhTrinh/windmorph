import { Button, Card, Divider } from '@windmorph/react';

/**
 * What a card holds: media, a headline, supporting text and actions about one subject. The
 * card itself stays static, so its buttons are the only things to press (an interactive
 * card can't contain its own buttons). A full-width divider separates the content from the
 * actions, and a filled card groups related details quietly.
 */
export function CardContent() {
  return (
    <div className="flex w-full flex-wrap items-start gap-4">
      <Card variant="outlined" className="w-full max-w-xs">
        <div
          aria-hidden="true"
          className="flex h-36 items-end bg-tertiary-container p-4 text-headline-small text-on-tertiary-container"
        >
          Phở
        </div>
        <div className="flex flex-col gap-1 p-4">
          <h3 className="text-title-medium text-on-surface">Phở night, Saturday 6pm</h3>
          <p className="text-body-medium text-on-surface-variant">
            Shared tables at the community hall, with a vegetarian broth too.
          </p>
        </div>
        <Divider />
        <div className="flex justify-end gap-2 p-2">
          <Button variant="text">Share</Button>
          <Button variant="tonal">Reserve a seat</Button>
        </div>
      </Card>
      <Card variant="filled" className="w-full max-w-xs">
        <div className="flex flex-col gap-3 p-4">
          <h3 className="text-title-medium text-on-surface">Order summary</h3>
          <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-body-medium">
            <dt className="text-on-surface-variant">Bánh mì × 2</dt>
            <dd className="text-on-surface">£12.00</dd>
            <dt className="text-on-surface-variant">Bún chả</dt>
            <dd className="text-on-surface">£9.50</dd>
            <dt className="text-on-surface-variant">Delivery</dt>
            <dd className="text-on-surface">£2.50</dd>
          </dl>
        </div>
      </Card>
    </div>
  );
}
