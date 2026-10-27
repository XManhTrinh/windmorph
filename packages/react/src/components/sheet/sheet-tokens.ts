import { color, corner, defineComponentTokens, elevation } from '../../tokens/component';

/*
 * The sheets' component tokens, M3's `md.comp.sheet.bottom.*` and `md.comp.sheet.side.*`
 * names (checked against m3.material.io's token tables, 2026-10-14), with Compose's
 * SheetBottomTokens defaults and Material Components Android's `m3_comp_sheet_side_*` values
 * (side sheets aren't in Compose). Each sheet's root carries its set's `data-tokens` and
 * `data-variant` (and a detached side sheet `data-detached`), and `sheet-styles.ts` reads one
 * private variable per part. No scrim token: M3 has none, so scrims stay on
 * `--md-sys-color-scrim`. Sizes, margins and dividers stay classes.
 */

const paintsContainer = { property: 'background-color' } as const;
const paintsElevation = { property: 'box-shadow' } as const;

/** The tokens of {@link BottomSheet}: `--md-comp-sheet-bottom-docked-[<variant>-]<part>`. */
export const bottomSheetTokenSet = defineComponentTokens({
  name: 'md-comp-sheet-bottom-docked',
  tokens: {
    'container-color': {
      value: color('surface-container-low'),
      description: 'The sheet.',
      compose: 'SheetBottomTokens.DockedContainerColor',
      paints: paintsContainer,
    },
    'container-shape': {
      value: corner('extra-large'),
      description: "The sheet's top corners.",
      compose: 'SheetBottomTokens.DockedContainerShape',
      paints: { property: 'border-top-left-radius' },
    },
    'drag-handle-color': {
      value: color('on-surface-variant'),
      description: 'The drag handle.',
      compose: 'SheetBottomTokens.DockedDragHandleColor',
      paints: { property: 'background-color', slot: 'drag-handle' },
    },
  },
  scopes: {
    variant: {
      modal: {
        prefix: 'md-comp-sheet-bottom-docked-modal',
        tokens: {
          'container-elevation': {
            value: elevation(1),
            description: 'The shadow of a modal sheet.',
            compose: 'SheetBottomTokens.DockedModalContainerElevation',
            paints: paintsElevation,
          },
        },
      },
      standard: {
        prefix: 'md-comp-sheet-bottom-docked-standard',
        tokens: {
          'container-elevation': {
            value: elevation(1),
            description: 'The shadow of a standard sheet.',
            compose: 'SheetBottomTokens.DockedStandardContainerElevation',
            paints: paintsElevation,
          },
        },
      },
    },
  },
});

/**
 * The tokens of {@link SideSheet}: `--md-comp-sheet-side-docked-<variant>-<part>`, and
 * `--md-comp-sheet-side-detached-container-shape` for a detached sheet.
 */
export const sideSheetTokenSet = defineComponentTokens({
  name: 'md-comp-sheet-side',
  tokens: {},
  scopes: {
    variant: {
      modal: {
        prefix: 'md-comp-sheet-side-docked-modal',
        tokens: {
          'container-color': {
            value: color('surface-container-low'),
            description: 'A modal sheet.',
            compose: 'm3_comp_sheet_side_docked_modal_container_color',
            paints: paintsContainer,
          },
          'container-elevation': {
            value: elevation(1),
            description: 'The shadow of a modal sheet.',
            compose: 'm3_comp_sheet_side_docked_modal_container_elevation',
            paints: paintsElevation,
          },
          'container-shape': {
            value: corner('large'),
            description: "A docked modal sheet's corners on its free edge.",
            compose: 'm3_comp_sheet_side_docked_modal_container_shape',
            paints: { property: 'border-top-left-radius' },
          },
        },
      },
      standard: {
        prefix: 'md-comp-sheet-side-docked-standard',
        tokens: {
          'container-color': {
            value: color('surface'),
            description: 'A standard sheet, beside the content.',
            compose: 'm3_comp_sheet_side_docked_standard_container_color',
            paints: { property: 'background-color', slot: 'panel' },
          },
        },
        fixed: { 'container-elevation': elevation(0), 'container-shape': '0px' },
      },
    },
    // After `variant`, so a detached sheet's corners win over the docked ones.
    detached: {
      true: {
        prefix: 'md-comp-sheet-side-detached',
        tokens: {
          'container-shape': {
            value: corner('large'),
            description: "A detached sheet's corners, all round.",
            compose: 'm3_comp_sheet_side_detached_container_shape',
            paints: { property: 'border-top-left-radius' },
          },
        },
      },
    },
  },
});
