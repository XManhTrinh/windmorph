import type { ReactNode } from 'react';

/*
 * Small decorative sketches of each component for the component index cards: plain shapes
 * in the component's own colour roles and corners, so they follow every theme, mode and
 * contrast level, cost nothing to render and hold nothing to focus. The card hides them
 * from assistive tech; its title names the component.
 */

type Tone = 'primary' | 'secondary' | 'tertiary' | 'high' | 'variant' | 'outline' | 'surface';

const FILL: Record<Tone, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary-container',
  tertiary: 'bg-tertiary-container',
  high: 'bg-surface-container-highest',
  variant: 'bg-outline-variant',
  outline: 'border-2 border-outline bg-surface',
  surface: 'bg-surface shadow-elevation-1',
};

/** A rounded rectangle; `w` and `h` in px. */
function Shape({
  w,
  h,
  tone = 'high',
  round = 'full',
}: {
  w: number;
  h: number;
  tone?: Tone;
  round?: 'full' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
}) {
  const radius = {
    full: 'rounded-corner-full',
    sm: 'rounded-corner-small',
    md: 'rounded-corner-medium',
    lg: 'rounded-corner-large',
    xl: 'rounded-corner-extra-large',
    none: 'rounded-none',
  }[round];
  return (
    <span className={`block shrink-0 ${FILL[tone]} ${radius}`} style={{ width: w, height: h }} />
  );
}

/** A line of text, as a thin bar. */
function Text({ w, strong = false }: { w: number; strong?: boolean }) {
  return (
    <span
      className={`block h-1.5 shrink-0 rounded-corner-full ${strong ? 'bg-on-surface-variant' : 'bg-outline-variant'}`}
      style={{ width: w }}
    />
  );
}

function Row({ children, gap = 2 }: { children: ReactNode; gap?: 1 | 2 | 3 }) {
  return (
    <span className={`flex items-center ${['', 'gap-1', 'gap-2', 'gap-3'][gap]}`}>{children}</span>
  );
}

function Col({ children, gap = 2 }: { children: ReactNode; gap?: 1 | 2 | 3 }) {
  return (
    <span className={`flex flex-col items-start ${['', 'gap-1', 'gap-2', 'gap-3'][gap]}`}>
      {children}
    </span>
  );
}

/** A panel standing for a surface (dialog, sheet, card) holding `children`. */
function Panel({
  children,
  w,
  h,
  round = 'lg',
  tone = 'surface',
}: {
  children?: ReactNode;
  w: number;
  h: number;
  round?: 'md' | 'lg' | 'xl';
  tone?: Tone;
}) {
  const radius = {
    md: 'rounded-corner-medium',
    lg: 'rounded-corner-large',
    xl: 'rounded-corner-extra-large',
  }[round];
  return (
    <span
      className={`flex shrink-0 flex-col gap-2 p-3 ${FILL[tone]} ${radius}`}
      style={{ width: w, height: h }}
    >
      {children}
    </span>
  );
}

/** A chevron, as a rotated corner: `down` for an open row, `forward` for a folded one. */
function Chevron({ to }: { to: 'down' | 'up' | 'forward' }) {
  const turn = { down: 'rotate-45', up: '-rotate-135', forward: '-rotate-45 rtl:rotate-135' }[to];
  return (
    <span
      className={`block size-2 shrink-0 border-e-2 border-b-2 border-on-surface-variant ${turn}`}
    />
  );
}

const listRows = (count: number, lead?: ReactNode) => (
  <Col gap={3}>
    {Array.from({ length: count }, (_, index) => (
      <Row key={index}>
        {lead}
        <Col gap={1}>
          <Text w={64} strong />
          <Text w={44} />
        </Col>
      </Row>
    ))}
  </Col>
);

const field = (tone: Tone = 'high', w = 140) => (
  <span className="flex flex-col gap-1">
    <span
      className={`flex h-9 items-center px-3 ${tone === 'outline' ? 'rounded-corner-extra-small border-2 border-outline' : 'rounded-t-corner-extra-small border-b-2 border-on-surface-variant bg-surface-container-highest'}`}
      style={{ width: w }}
    >
      <Text w={56} strong />
    </span>
  </span>
);

/** The sketch for each component page, by slug. */
export const COMPONENT_PREVIEWS: Record<string, ReactNode> = {
  button: (
    <Row>
      <Shape w={64} h={28} tone="primary" />
      <Shape w={64} h={28} tone="secondary" />
      <Shape w={64} h={28} tone="outline" />
    </Row>
  ),
  'icon-button': (
    <Row>
      <Shape w={32} h={32} tone="primary" />
      <Shape w={32} h={32} tone="secondary" round="md" />
      <Shape w={32} h={32} tone="outline" />
    </Row>
  ),
  'button-group': (
    <Row gap={1}>
      <Shape w={48} h={32} tone="primary" />
      <Shape w={48} h={32} tone="secondary" round="sm" />
      <Shape w={48} h={32} tone="secondary" round="sm" />
    </Row>
  ),
  'split-button': (
    <Row gap={1}>
      <Shape w={72} h={32} tone="primary" />
      <Shape w={32} h={32} tone="primary" />
    </Row>
  ),
  fab: (
    <Row gap={3}>
      <Shape w={48} h={48} tone="primary" round="lg" />
      <Shape w={96} h={48} tone="tertiary" round="lg" />
    </Row>
  ),
  'fab-menu': (
    <Col gap={1}>
      <Shape w={88} h={28} tone="secondary" />
      <Shape w={72} h={28} tone="secondary" />
      <Row>
        <Shape w={40} h={40} tone="primary" />
      </Row>
    </Col>
  ),
  'reaction-picker': (
    <Panel w={156} h={44} round="xl" tone="surface">
      <Row>
        <Shape w={20} h={20} tone="tertiary" />
        <Shape w={20} h={20} tone="secondary" />
        <Shape w={20} h={20} tone="tertiary" />
        <Shape w={20} h={20} tone="secondary" />
        <Shape w={20} h={20} tone="tertiary" />
      </Row>
    </Panel>
  ),
  'reaction-summary': (
    <Row gap={1}>
      <Shape w={20} h={20} tone="tertiary" />
      <Shape w={20} h={20} tone="secondary" />
      <Text w={24} strong />
    </Row>
  ),
  'search-field': (
    <Col gap={2}>
      <span className="flex h-9 w-44 items-center gap-2 rounded-full bg-surface-container-high px-3">
        <span className="size-3.5 shrink-0 rounded-full border-2 border-on-surface-variant" />
        <Text w={56} strong />
        <span className="ms-auto size-3.5 shrink-0 rounded-full bg-on-surface-variant" />
      </span>
      <span className="flex flex-col gap-1.5 ps-3">
        <Text w={120} />
        <Text w={92} />
      </span>
    </Col>
  ),
  'copy-field': (
    <span className="flex h-10 w-48 items-center rounded-corner-extra-small border-2 border-outline ps-3 pe-1.5">
      <Text w={104} strong />
      <span className="ms-auto">
        <Shape w={26} h={26} tone="secondary" />
      </span>
    </span>
  ),
  'time-field': (
    <span className="flex h-10 w-40 items-center gap-1.5 rounded-corner-extra-small border-2 border-outline ps-3 pe-2">
      <Text w={16} strong />
      <span className="flex flex-col gap-1">
        <span className="size-1 rounded-full bg-on-surface-variant" />
        <span className="size-1 rounded-full bg-on-surface-variant" />
      </span>
      <Text w={16} strong />
      <Text w={18} />
      <span className="ms-auto grid size-6 shrink-0 place-items-center rounded-full border-2 border-on-surface-variant">
        <span className="size-1 rounded-full bg-on-surface-variant" />
      </span>
    </span>
  ),
  'text-field': (
    <Col>
      {field('high')}
      {field('outline')}
    </Col>
  ),
  'message-field': (
    <Row>
      <Shape w={150} h={36} tone="high" />
      <Shape w={36} h={36} tone="primary" />
    </Row>
  ),
  'rich-message-field': (
    <Panel w={190} h={64} round="lg" tone="high">
      <Row gap={1}>
        <Shape w={16} h={16} tone="variant" round="sm" />
        <Shape w={16} h={16} tone="variant" round="sm" />
        <Shape w={16} h={16} tone="variant" round="sm" />
      </Row>
      <Text w={110} strong />
    </Panel>
  ),
  select: (
    <Col gap={1}>
      {field('outline')}
      <Panel w={140} h={52} round="md" tone="surface">
        <Text w={70} strong />
        <Text w={50} />
      </Panel>
    </Col>
  ),
  autocomplete: (
    <Row gap={1}>
      <Shape w={52} h={24} tone="secondary" round="sm" />
      <Shape w={52} h={24} tone="secondary" round="sm" />
      <Text w={40} strong />
    </Row>
  ),
  'file-trigger': (
    <Row>
      <Shape w={36} h={36} tone="secondary" />
      <Shape w={96} h={36} tone="outline" />
    </Row>
  ),
  'image-crop': (
    <span className="relative grid size-24 place-items-center rounded-corner-medium bg-tertiary-container">
      <span className="size-16 rounded-full border-2 border-on-tertiary-container" />
    </span>
  ),
  'media-upload-grid': (
    <Row gap={1}>
      <Shape w={44} h={44} tone="tertiary" round="sm" />
      <Shape w={44} h={44} tone="secondary" round="sm" />
      <span className="grid size-11 place-items-center rounded-corner-small border-2 border-dashed border-outline" />
    </Row>
  ),
  'phone-field': (
    <Row gap={1}>
      <Shape w={52} h={36} tone="outline" round="sm" />
      <Shape w={110} h={36} tone="outline" round="sm" />
    </Row>
  ),
  'pin-input': (
    <Row gap={1}>
      <Shape w={28} h={36} tone="outline" round="sm" />
      <Shape w={28} h={36} tone="outline" round="sm" />
      <Shape w={28} h={36} tone="outline" round="sm" />
      <Shape w={28} h={36} tone="outline" round="sm" />
    </Row>
  ),
  checkbox: (
    <Col>
      <Row>
        <Shape w={18} h={18} tone="primary" round="sm" />
        <Text w={64} strong />
      </Row>
      <Row>
        <Shape w={18} h={18} tone="outline" round="sm" />
        <Text w={52} strong />
      </Row>
    </Col>
  ),
  'radio-group': (
    <Col>
      <Row>
        <span className="grid size-5 place-items-center rounded-full border-2 border-primary">
          <span className="size-2.5 rounded-full bg-primary" />
        </span>
        <Text w={64} strong />
      </Row>
      <Row>
        <span className="size-5 rounded-full border-2 border-on-surface-variant" />
        <Text w={52} strong />
      </Row>
    </Col>
  ),
  switch: (
    <Row gap={3}>
      <span className="flex h-8 w-13 items-center justify-end rounded-full bg-primary px-1">
        <span className="size-6 rounded-full bg-on-primary" />
      </span>
      <span className="flex h-8 w-13 items-center rounded-full border-2 border-outline bg-surface-container-highest px-1.5">
        <span className="size-4 rounded-full bg-outline" />
      </span>
    </Row>
  ),
  slider: (
    <Row gap={1}>
      <Shape w={90} h={16} tone="primary" round="sm" />
      <Shape w={4} h={40} tone="primary" />
      <Shape w={60} h={16} tone="secondary" round="sm" />
    </Row>
  ),
  chips: (
    <Row gap={1}>
      <Shape w={56} h={28} tone="secondary" round="sm" />
      <Shape w={56} h={28} tone="outline" round="sm" />
      <Shape w={48} h={28} tone="outline" round="sm" />
    </Row>
  ),
  card: (
    <Row>
      <Panel w={84} h={84} round="md" tone="high">
        <Shape w={60} h={30} tone="tertiary" round="sm" />
        <Text w={44} strong />
      </Panel>
      <Panel w={84} h={84} round="md" tone="surface">
        <Shape w={60} h={30} tone="secondary" round="sm" />
        <Text w={44} strong />
      </Panel>
    </Row>
  ),
  dialog: (
    <Panel w={170} h={96} round="xl" tone="high">
      <Text w={90} strong />
      <Text w={130} />
      <span className="mt-auto flex justify-end gap-3">
        <Text w={28} strong />
        <Text w={28} strong />
      </span>
    </Panel>
  ),
  'confirm-dialog': (
    <Panel w={170} h={104} round="xl" tone="high">
      <span className="flex flex-col items-center gap-2">
        <Shape w={18} h={18} tone="tertiary" />
        <Text w={96} strong />
        <Text w={128} />
      </span>
      <span className="mt-auto flex justify-end gap-3">
        <Text w={28} strong />
        <span className="block h-1.5 w-9 rounded-full bg-primary" />
      </span>
    </Panel>
  ),
  popover: (
    <Col gap={1}>
      <Shape w={72} h={26} tone="secondary" />
      <Panel w={150} h={70} round="md" tone="surface">
        <Text w={84} strong />
        <Text w={118} />
        <Shape w={52} h={16} tone="primary" />
      </Panel>
    </Col>
  ),
  menu: (
    <Panel w={124} h={96} round="md" tone="surface">
      <Text w={80} strong />
      <Text w={64} strong />
      <Text w={72} strong />
      <Text w={56} strong />
    </Panel>
  ),
  tooltip: (
    <Col gap={1}>
      <span className="rounded-corner-extra-small bg-inverse-surface px-2 py-1.5">
        <span className="block h-1.5 w-14 rounded-full bg-inverse-on-surface" />
      </span>
      <Shape w={32} h={32} tone="secondary" />
    </Col>
  ),
  sheets: (
    <span className="flex h-24 w-44 items-end overflow-hidden rounded-corner-medium bg-surface-container-high">
      <span className="flex h-14 w-full flex-col items-center gap-2 rounded-t-corner-extra-large bg-surface-container-low pt-2 shadow-elevation-1">
        <span className="h-1 w-8 rounded-full bg-on-surface-variant" />
        <Text w={100} />
      </span>
    </span>
  ),
  list: listRows(3, <Shape w={28} h={28} tone="tertiary" />),
  'list-detail-layout': (
    <Row gap={1}>
      <Panel w={64} h={88} round="md" tone="high">
        <Text w={40} strong />
        <Text w={32} />
        <Text w={40} strong />
      </Panel>
      <Panel w={112} h={88} round="md" tone="high">
        <Text w={70} strong />
        <Text w={88} />
        <Text w={80} />
      </Panel>
    </Row>
  ),
  carousel: (
    <Row gap={1}>
      <Shape w={92} h={84} tone="tertiary" round="xl" />
      <Shape w={52} h={84} tone="secondary" round="xl" />
      <Shape w={20} h={84} tone="high" round="xl" />
    </Row>
  ),
  'media-grid': (
    <span className="grid grid-cols-3 gap-1">
      <Shape w={40} h={40} tone="tertiary" round="sm" />
      <Shape w={40} h={40} tone="secondary" round="sm" />
      <Shape w={40} h={40} tone="high" round="sm" />
      <Shape w={40} h={40} tone="secondary" round="sm" />
      <Shape w={40} h={40} tone="high" round="sm" />
      <Shape w={40} h={40} tone="tertiary" round="sm" />
    </span>
  ),
  'media-viewer': (
    <span className="flex h-24 w-40 flex-col justify-between rounded-corner-medium bg-inverse-surface p-2">
      <span className="flex justify-between">
        <span className="size-4 rounded-full bg-inverse-on-surface" />
        <span className="size-4 rounded-full bg-inverse-on-surface" />
      </span>
      <span className="mx-auto h-10 w-20 rounded-corner-small bg-tertiary-container" />
      <span className="mx-auto h-1.5 w-16 rounded-full bg-inverse-on-surface" />
    </span>
  ),
  'shaped-icon': (
    <Row gap={3}>
      <Shape w={40} h={40} tone="primary" round="lg" />
      <span className="size-10 rotate-45 rounded-corner-medium bg-tertiary-container" />
      <Shape w={40} h={40} tone="secondary" />
    </Row>
  ),
  'comment-row': (
    <Row>
      <Shape w={28} h={28} tone="tertiary" />
      <Panel w={140} h={48} round="lg" tone="high">
        <Text w={50} strong />
        <Text w={100} />
      </Panel>
    </Row>
  ),
  collapse: (
    <Col gap={1}>
      <Row>
        <Text w={90} strong />
        <span className="size-3 rotate-45 border-e-2 border-b-2 border-on-surface-variant" />
      </Row>
      <Panel w={150} h={44} round="md" tone="high">
        <Text w={110} />
        <Text w={80} />
      </Panel>
    </Col>
  ),
  accordion: (
    <span className="flex w-44 flex-col divide-y divide-outline-variant">
      <span className="flex items-center justify-between py-2.5">
        <Text w={84} strong />
        <Chevron to="down" />
      </span>
      <span className="flex flex-col gap-2 py-2.5">
        <span className="flex items-center justify-between">
          <Text w={64} strong />
          <Chevron to="up" />
        </span>
        <Text w={150} />
        <Text w={110} />
      </span>
      <span className="flex items-center justify-between py-2.5">
        <Text w={96} strong />
        <Chevron to="down" />
      </span>
    </span>
  ),
  'tree-view': (
    <Col gap={2}>
      <Row>
        <Chevron to="down" />
        <Text w={76} strong />
      </Row>
      <span className="ps-5">
        <Row>
          <Chevron to="forward" />
          <Text w={64} />
        </Row>
      </span>
      <span className="ps-5">
        <Row>
          <span className="size-2 shrink-0 rounded-full bg-secondary-container" />
          <Text w={52} />
        </Row>
      </span>
      <Row>
        <Chevron to="forward" />
        <Text w={88} strong />
      </Row>
    </Col>
  ),
  'expandable-text': (
    <Col gap={1}>
      <Text w={150} />
      <Text w={150} />
      <Row>
        <Text w={90} />
        <span className="h-1.5 w-10 rounded-full bg-primary" />
      </Row>
    </Col>
  ),
  avatar: (
    <Row gap={1}>
      <Shape w={36} h={36} tone="tertiary" />
      <Shape w={36} h={36} tone="secondary" />
      <Shape w={36} h={36} tone="primary" />
    </Row>
  ),
  badge: (
    <Row gap={3}>
      <span className="relative block size-8 rounded-corner-small bg-secondary-container">
        <span className="absolute -end-1 -top-1 size-2 rounded-full bg-error" />
      </span>
      <span className="relative block size-8 rounded-corner-small bg-secondary-container">
        <span className="absolute -end-2 -top-1.5 h-4 w-5 rounded-full bg-error" />
      </span>
    </Row>
  ),
  tag: (
    <Row gap={1}>
      <Shape w={52} h={20} tone="tertiary" round="sm" />
      <Shape w={44} h={20} tone="secondary" round="sm" />
      <Shape w={48} h={20} tone="outline" round="sm" />
    </Row>
  ),
  'code-block': (
    <Panel w={150} h={72} round="md" tone="high">
      <Col gap={1}>
        <Row gap={1}>
          <span className="block h-1.5 w-8 rounded-full bg-primary" />
          <Text w={60} />
        </Row>
        <Row gap={1}>
          <span className="block h-1.5 w-6 rounded-full bg-tertiary" />
          <Text w={44} />
        </Row>
        <Text w={30} />
      </Col>
    </Panel>
  ),
  'props-table': (
    <Panel w={150} h={72} round="md" tone="outline">
      <Col gap={2}>
        <Row gap={2}>
          <Text w={30} strong />
          <Text w={40} strong />
          <Text w={36} strong />
        </Row>
        <Row gap={2}>
          <Text w={30} />
          <Text w={40} />
          <Text w={36} />
        </Row>
        <Row gap={2}>
          <Text w={30} />
          <Text w={40} />
          <Text w={36} />
        </Row>
      </Col>
    </Panel>
  ),
  'data-table': (
    <span className="flex w-48 flex-col overflow-hidden rounded-corner-medium border border-outline-variant bg-surface">
      {[0, 1, 2, 3].map((row) => (
        <span
          key={row}
          className={`flex items-center gap-3 px-3 py-1.5 ${row > 0 ? 'border-t border-outline-variant' : 'bg-surface-container'} ${row === 2 ? 'bg-secondary-container' : ''}`}
        >
          <span
            className={`size-2.5 shrink-0 rounded-corner-extra-small ${row === 2 ? 'bg-primary' : 'border border-on-surface-variant'}`}
          />
          <Text w={52} strong={row === 0} />
          <Text w={32} strong={row === 0} />
          <Text w={24} strong={row === 0} />
        </span>
      ))}
    </span>
  ),
  'data-grid': (
    <span className="grid w-48 grid-cols-4 overflow-hidden rounded-corner-small border border-outline-variant bg-surface">
      {Array.from({ length: 16 }, (_, index) => (
        <span
          key={index}
          className={`flex h-6 items-center border-outline-variant px-1.5 ${index % 4 ? 'border-s' : ''} ${index > 3 ? 'border-t' : 'bg-surface-container'} ${[9, 10, 13, 14].includes(index) ? 'bg-secondary-container' : ''} ${index === 5 ? 'outline-2 -outline-offset-2 outline-primary' : ''}`}
        >
          <Text w={index < 4 ? 20 : 26} strong={index < 4} />
        </span>
      ))}
    </span>
  ),
  divider: (
    <Col gap={3}>
      <Text w={150} />
      <span className="block h-px w-40 bg-outline-variant" />
      <Text w={120} />
    </Col>
  ),
  'skip-link': (
    <Col gap={1}>
      <Shape w={100} h={28} tone="primary" round="md" />
      <Text w={150} />
    </Col>
  ),
  link: (
    <Col gap={1}>
      <Row gap={1}>
        <Text w={60} />
        <span className="block h-1.5 w-12 rounded-full bg-primary" />
        <Text w={30} />
      </Row>
      <Text w={120} />
    </Col>
  ),
  'navigation-rail': (
    <span className="flex h-24 w-16 flex-col items-center gap-2 rounded-corner-medium bg-surface-container py-2">
      <Shape w={36} h={20} tone="secondary" />
      <Shape w={20} h={20} tone="variant" round="sm" />
      <Shape w={20} h={20} tone="variant" round="sm" />
    </span>
  ),
  'navigation-rail-group': (
    <span className="flex h-24 items-stretch gap-1">
      <span className="flex w-14 flex-col items-center gap-2 rounded-corner-medium bg-surface-container py-2">
        <Shape w={20} h={20} tone="variant" round="sm" />
        <Shape w={36} h={20} tone="secondary" />
        <Shape w={20} h={20} tone="variant" round="sm" />
      </span>
      <span className="flex w-28 flex-col gap-2.5 rounded-corner-medium bg-surface-container-low p-3 shadow-elevation-1">
        <Text w={44} />
        <Text w={72} strong />
        <span className="block h-1.5 w-14 rounded-full bg-primary" />
        <Text w={60} strong />
      </span>
    </span>
  ),
  'side-panel-rail': (
    <span className="flex h-24 w-48 overflow-hidden rounded-corner-medium bg-surface-container-high">
      <span className="flex flex-1 flex-col gap-2 p-3">
        <Text w={88} strong />
        <Text w={104} />
        <Text w={72} />
      </span>
      <span className="flex w-10 shrink-0 flex-col items-center gap-2 bg-surface-container-low py-2">
        <Shape w={24} h={24} tone="secondary" />
        <Shape w={18} h={18} tone="variant" round="sm" />
        <Shape w={18} h={18} tone="variant" round="sm" />
      </span>
    </span>
  ),
  'navigation-bar': (
    <span className="flex h-12 w-48 items-center justify-around rounded-corner-medium bg-surface-container">
      <Shape w={36} h={20} tone="secondary" />
      <Shape w={20} h={20} tone="variant" round="sm" />
      <Shape w={20} h={20} tone="variant" round="sm" />
    </span>
  ),
  tabs: (
    <span className="flex w-44 flex-col">
      <span className="flex justify-around pb-2">
        <span className="block h-1.5 w-10 rounded-full bg-primary" />
        <Text w={40} />
        <Text w={40} />
      </span>
      <span className="flex border-b border-outline-variant ps-2">
        <span className="block h-[3px] w-10 rounded-t-[3px] bg-primary" />
      </span>
    </span>
  ),
  'top-app-bar': (
    <span className="flex h-12 w-48 items-center gap-3 rounded-corner-medium bg-surface-container px-3">
      <Shape w={18} h={18} tone="variant" round="sm" />
      <Text w={80} strong />
      <span className="ms-auto">
        <Shape w={18} h={18} tone="variant" round="sm" />
      </span>
    </span>
  ),
  search: (
    <span className="flex h-10 w-48 items-center gap-3 rounded-full bg-surface-container-high px-3">
      <span className="size-3.5 rounded-full border-2 border-on-surface-variant" />
      <Text w={72} />
    </span>
  ),
  toolbars: (
    <span className="flex h-12 items-center gap-2 rounded-full bg-surface-container px-2 shadow-elevation-3">
      <Shape w={28} h={28} tone="variant" />
      <Shape w={28} h={28} tone="secondary" />
      <Shape w={28} h={28} tone="variant" />
      <Shape w={36} h={36} tone="primary" round="lg" />
    </span>
  ),
  alert: (
    <Panel w={180} h={52} round="md" tone="tertiary">
      <Row>
        <Shape w={18} h={18} tone="surface" />
        <Col gap={1}>
          <Text w={90} strong />
          <Text w={120} />
        </Col>
      </Row>
    </Panel>
  ),
  snackbar: (
    <span className="flex h-11 w-48 items-center justify-between rounded-corner-extra-small bg-inverse-surface px-3 shadow-elevation-3">
      <span className="h-1.5 w-20 rounded-full bg-inverse-on-surface" />
      <span className="h-1.5 w-8 rounded-full bg-inverse-primary" />
    </span>
  ),
  progress: (
    <Col gap={3}>
      <Row gap={1}>
        <Shape w={100} h={4} tone="primary" />
        <Shape w={50} h={4} tone="secondary" />
      </Row>
      <span className="size-10 rounded-full border-4 border-secondary-container border-t-primary border-e-primary" />
    </Col>
  ),
  'load-more': (
    <Col gap={2}>
      <Text w={150} />
      <Text w={150} />
      <Shape w={100} h={32} tone="outline" />
    </Col>
  ),
  'loading-indicator': (
    <span className="grid size-16 place-items-center rounded-full bg-primary-container">
      <span className="size-9 rotate-12 rounded-corner-large bg-primary" />
    </span>
  ),
  'pull-to-refresh': (
    <Col gap={2}>
      <span className="mx-auto grid size-10 place-items-center rounded-full bg-primary-container">
        <span className="size-6 rotate-12 rounded-corner-medium bg-on-primary-container" />
      </span>
      <Text w={140} />
      <Text w={110} />
    </Col>
  ),
  skeleton: (
    <Row>
      <Shape w={36} h={36} tone="high" />
      <Col gap={2}>
        <Shape w={110} h={10} tone="high" round="sm" />
        <Shape w={80} h={10} tone="high" round="sm" />
      </Col>
    </Row>
  ),
  'empty-state': (
    <Col gap={2}>
      <span className="mx-auto">
        <Shape w={44} h={44} tone="secondary" round="lg" />
      </span>
      <Text w={90} strong />
      <Text w={120} />
    </Col>
  ),
  'date-picker': (
    <Panel w={150} h={96} round="xl" tone="high">
      <span className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={index}
            className={`size-3 rounded-full ${index === 8 ? 'bg-primary' : 'bg-outline-variant'}`}
          />
        ))}
      </span>
    </Panel>
  ),
  calendar: (
    <span className="grid w-48 grid-cols-5 gap-px overflow-hidden rounded-corner-medium border border-outline-variant bg-outline-variant">
      {Array.from({ length: 15 }, (_, index) => (
        <span key={index} className="flex h-8 flex-col gap-1 bg-surface p-1">
          <span
            className={`size-1.5 shrink-0 rounded-full ${index === 7 ? 'bg-primary' : 'bg-outline-variant'}`}
          />
          {[1, 7, 8, 12].includes(index) && (
            <span
              className={`block h-1.5 rounded-full ${index === 8 ? 'w-full bg-tertiary-container' : index === 7 ? 'w-full bg-primary' : 'w-4/5 bg-secondary-container'}`}
            />
          )}
        </span>
      ))}
    </span>
  ),
  'time-picker': (
    <span className="relative grid size-24 place-items-center rounded-full bg-surface-container-highest">
      <span className="absolute start-1/2 top-1/2 h-0.5 w-9 origin-left -rotate-45 bg-primary" />
      <span className="size-2 rounded-full bg-primary" />
    </span>
  ),
  'picker-dialog': (
    <Panel w={150} h={96} round="xl" tone="high">
      <Text w={70} strong />
      <Shape w={120} h={28} tone="secondary" round="sm" />
      <span className="mt-auto flex justify-end gap-3">
        <Text w={28} strong />
        <Text w={28} strong />
      </span>
    </Panel>
  ),
  primitives: (
    <Row gap={3}>
      <Shape w={36} h={36} tone="primary" round="md" />
      <Shape w={36} h={36} tone="secondary" />
      <Shape w={36} h={36} tone="tertiary" round="sm" />
    </Row>
  ),
};

/** The sketch for `slug`, framed for a card: decorative, inert and hidden from assistive tech. */
export function ComponentPreview({ slug }: { slug: string }) {
  return (
    <span
      aria-hidden="true"
      inert
      className="pointer-events-none flex h-32 items-center justify-center overflow-hidden rounded-corner-medium bg-surface-container"
    >
      {COMPONENT_PREVIEWS[slug]}
    </span>
  );
}
