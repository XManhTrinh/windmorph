'use client';

import { Button, ButtonGroup, Switch, TextField } from '@windmorph/react';
import type { Key } from 'react';
import type { ControlDef } from './controls-model';

function SegmentedControl({
  def,
  value,
  onChange,
}: {
  def: ControlDef;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const options = def.options ?? [];
  const selected = value && options.includes(value) ? value : options[0];
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-label-medium text-on-surface-variant">{def.label}</span>
      {/*
       * The standard variant (individually-rounded buttons) with `flex-wrap` lets a long
       * option set wrap onto multiple lines and stay fully inside the Playground card at any
       * width — a connected group is a single non-wrapping row and overflowed the panel.
       */}
      <ButtonGroup
        variant="standard"
        size="xs"
        selectionMode="single"
        disallowEmptySelection
        aria-label={def.label}
        className="flex-wrap gap-1.5"
        selectedKeys={selected ? [selected] : []}
        onSelectionChange={(keys: Set<Key>) => {
          const [next] = [...keys];
          if (next != null) onChange(String(next));
        }}
      >
        {options.map((option) => (
          <Button key={option} toggle value={option}>
            {option}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}

/** Renders the right control for a surfaced prop: segmented (enum), switch (boolean), field. */
export function Control({
  def,
  value,
  onChange,
}: {
  def: ControlDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (def.kind === 'enum' && def.options && def.options.length > 0) {
    return <SegmentedControl def={def} value={value as string | undefined} onChange={onChange} />;
  }
  if (def.kind === 'boolean') {
    return (
      <Switch selected={Boolean(value)} onSelectedChange={(next) => onChange(next)}>
        {def.label}
      </Switch>
    );
  }
  if (def.kind === 'number') {
    return (
      <TextField
        label={def.label}
        inputMode="numeric"
        value={value == null ? '' : String(value)}
        onChange={(next) => onChange(next === '' ? undefined : Number(next))}
      />
    );
  }
  return (
    <TextField
      label={def.label}
      value={value == null ? '' : String(value)}
      onChange={(next) => onChange(next === '' ? undefined : next)}
    />
  );
}
