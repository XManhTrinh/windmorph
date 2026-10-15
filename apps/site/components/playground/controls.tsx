'use client';

import {
  Button,
  ButtonGroup,
  IconButton,
  RichTooltip,
  RichTooltipTrigger,
  Select,
  SelectItem,
  Slider,
  Switch,
  TextField,
} from '@windmorph/react';
import { useId, useState, type Key, type ReactNode } from 'react';
import { componentTabHref } from '../../content/components/doc';
import { propAnchor } from '../../lib/prop-list-model';
import { ExpandMoreIcon, InfoIcon } from '../icons';
import { InlineMarkdown } from '../inline-markdown';
import { CHEVRON, REVEAL } from '../prop-list-controls';
import {
  CONTROL_GROUP_LABELS,
  clampToRange,
  groupControls,
  isSegmented,
  type ControlDef,
} from './controls-model';

/**
 * A field-like control (a select, a slider, a text field) fills the row beside the prop's
 * name, and the whole row under it when the name leaves it less than 144px.
 */
const FIELD = 'w-full';

/** Whether a control is field-like (see {@link FIELD}); a switch or a button group keeps its size. */
function isField(def: ControlDef): boolean {
  if (def.kind === 'boolean') return false;
  return !(def.kind === 'enum' && def.options && isSegmented(def.options));
}

/** A choice among a few short options: M3's connected button group, as a single selection. */
function SegmentedChoice({
  labelId,
  options,
  value,
  onChange,
}: {
  labelId: string;
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  // An unset value (the component's own default applies) selects nothing.
  const selected = value !== undefined && options.includes(value) ? value : undefined;
  return (
    <ButtonGroup
      variant="connected"
      size="xs"
      selectionMode="single"
      disallowEmptySelection={selected !== undefined}
      aria-labelledby={labelId}
      selectedKeys={selected ? [selected] : []}
      onSelectionChange={(keys: Set<Key>) => {
        const [next] = [...keys];
        if (next != null) onChange(String(next));
      }}
    >
      {options.map((option) => (
        <Button key={option} toggle value={option} variant="tonal">
          {option}
        </Button>
      ))}
    </ButtonGroup>
  );
}

/** A choice among many or long options: an outlined select. */
function SelectChoice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      variant="outlined"
      aria-label={label}
      placeholder="Default"
      className={FIELD}
      value={value !== undefined && options.includes(value) ? value : null}
      onChange={(next) => {
        if (next != null) onChange(String(next));
      }}
    >
      {options.map((option) => (
        <SelectItem key={option}>{option}</SelectItem>
      ))}
    </Select>
  );
}

/** A number with a range: a slider and its value, read out beside it. */
function NumberSlider({
  range,
  rest,
  label,
  value,
  onChange,
}: {
  range: NonNullable<ControlDef['range']>;
  rest: number | undefined;
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  const { min, max, step = 1 } = range;
  return (
    <div className={`flex items-center gap-3 ${FIELD}`}>
      <Slider
        // The slider names its own input from `aria-label` (it has no visible label of its own).
        aria-label={label}
        minValue={min}
        maxValue={max}
        step={step}
        // Unset, the slider rests on the prop's default (or the start) and the readout dims.
        value={value ?? rest ?? min}
        onChange={(next: number) => onChange(clampToRange(next, range))}
        className="min-w-0 flex-1"
      />
      {/* The slider announces its own value; this is the sighted readout. */}
      <span
        aria-hidden="true"
        data-readout=""
        data-unset={value === undefined || undefined}
        className="w-10 shrink-0 text-end text-label-large tabular-nums text-on-surface data-unset:text-on-surface-variant"
      >
        {value ?? rest ?? '–'}
      </span>
    </div>
  );
}

/**
 * The control's info: a toggletip (M3's persistent rich tooltip) with the prop's description
 * and a link to its entry in the API tab.
 */
function ControlInfo({ def, slug }: { def: ControlDef; slug: string }) {
  if (!def.description && !def.docsComponent) return null;
  const href =
    def.docsComponent && def.docsProp
      ? `${componentTabHref(slug, 'api')}#${propAnchor(def.docsComponent, def.docsProp)}`
      : undefined;
  return (
    <RichTooltipTrigger persistent placement="bottom start">
      <IconButton
        variant="standard"
        size="xs"
        icon={<InfoIcon />}
        aria-label={`About ${def.label}`}
        tooltip={false}
        className="shrink-0 text-on-surface-variant"
      />
      <RichTooltip
        title={<span dir="ltr">{def.label}</span>}
        classNames={{ panel: 'max-w-[312px]' }}
        action={
          href && (
            <Button variant="text" size="sm" href={href}>
              API reference
            </Button>
          )
        }
      >
        {def.description
          ? def.description.split(/\n\s*\n/).map((paragraph, index) => (
              <p key={index}>
                <InlineMarkdown text={paragraph.replace(/\s*\n\s*/g, ' ')} />
              </p>
            ))
          : 'See its entry in the API reference.'}
      </RichTooltip>
    </RichTooltipTrigger>
  );
}

/** The control for a prop's kind: a switch, a segmented choice or select, a slider or a field. */
function ControlInput({
  def,
  labelId,
  value,
  onChange,
}: {
  def: ControlDef;
  labelId: string;
  value: unknown;
  onChange: (value: unknown) => void;
}): ReactNode {
  if (def.kind === 'enum' && def.options && def.options.length > 0) {
    const current = value === undefined ? undefined : String(value);
    const change = (next: string) => onChange(def.numeric ? Number(next) : next);
    return isSegmented(def.options) ? (
      <SegmentedChoice labelId={labelId} options={def.options} value={current} onChange={change} />
    ) : (
      <SelectChoice label={def.label} options={def.options} value={current} onChange={change} />
    );
  }
  if (def.kind === 'boolean') {
    return (
      <Switch
        aria-labelledby={labelId}
        selected={Boolean(value)}
        onSelectedChange={(next) => onChange(next)}
      />
    );
  }
  if (def.kind === 'number' && def.range) {
    return (
      <NumberSlider
        range={def.range}
        rest={def.rest}
        label={def.label}
        value={typeof value === 'number' ? value : undefined}
        onChange={onChange}
      />
    );
  }
  return (
    <TextField
      variant="outlined"
      aria-labelledby={labelId}
      className={FIELD}
      {...(def.kind === 'number' && { inputMode: 'numeric' as const })}
      value={value == null ? '' : String(value)}
      onChange={(next) =>
        onChange(next === '' ? undefined : def.kind === 'number' ? Number(next) : next)
      }
    />
  );
}

/**
 * One control as an M3 list row: the prop's name and its info at the start, the control at
 * the end. A control too wide to sit beside the name wraps under it, still at the end.
 */
export function ControlRow({
  def,
  slug,
  value,
  onChange,
}: {
  def: ControlDef;
  slug: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const labelId = useId();
  return (
    <div
      data-control={def.name}
      className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 py-1"
    >
      <div className="me-auto flex min-w-0 items-center gap-1">
        <span id={labelId} dir="ltr" className="min-w-0 break-all text-body-large text-on-surface">
          {def.label}
        </span>
        <ControlInfo def={def} slug={slug} />
      </div>
      <div
        className={
          isField(def)
            ? 'flex min-w-0 grow basis-36'
            : 'ms-auto flex min-w-0 max-w-full justify-end'
        }
      >
        <ControlInput def={def} labelId={labelId} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

/** Advanced, folded behind a disclosure until it's wanted. */
function AdvancedFold({ count, children }: { count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  return (
    <>
      <h4>
        <Button
          variant="text"
          size="sm"
          leadingIcon={<ExpandMoreIcon />}
          aria-expanded={open}
          aria-controls={listId}
          onPress={() => setOpen((value) => !value)}
          className={`-ms-3 ${CHEVRON}`}
        >
          {`${CONTROL_GROUP_LABELS.advanced} (${count})`}
        </Button>
      </h4>
      <div id={listId} hidden={!open} className={REVEAL}>
        {children}
      </div>
    </>
  );
}

/**
 * The controls in their sections (Appearance, Content, Behaviour, and Advanced folded), each
 * a run of list rows under its subhead.
 */
export function ControlGroups({
  controls,
  slug,
  values,
  onChange,
}: {
  controls: readonly ControlDef[];
  slug: string;
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}) {
  const rows = (members: ControlDef[]) =>
    members.map((def) => (
      <ControlRow
        key={def.name}
        def={def}
        slug={slug}
        value={values[def.name]}
        onChange={(value) => onChange(def.name, value)}
      />
    ));
  const idPrefix = useId();
  return (
    <div className="flex flex-col gap-3">
      {groupControls(controls).map(({ group, controls: members }) => {
        const headingId = `${idPrefix}-${group}`;
        return (
          <div
            key={group}
            role="group"
            aria-labelledby={group === 'advanced' ? undefined : headingId}
            aria-label={group === 'advanced' ? CONTROL_GROUP_LABELS.advanced : undefined}
            data-control-group={group}
            className="flex flex-col"
          >
            {group === 'advanced' ? (
              <AdvancedFold count={members.length}>{rows(members)}</AdvancedFold>
            ) : (
              <>
                <h4 id={headingId} className="pb-1 pt-2 text-title-small text-on-surface-variant">
                  {CONTROL_GROUP_LABELS[group]}
                </h4>
                {rows(members)}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
