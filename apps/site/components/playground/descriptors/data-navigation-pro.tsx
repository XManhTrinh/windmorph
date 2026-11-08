'use client';

import { Button, NavigationRail, TimeField } from '@windmorph/react';
import {
  CopyField,
  DataTable,
  NavigationRailGroup,
  NavigationRailGroupItem,
  Popover,
  PopoverTrigger,
  TreeView,
  TreeViewItemContent,
  type ColumnDef,
  type TreeViewNode,
} from '@windmorph/react-pro';
import { Calendar, type CalendarEventInput } from '@windmorph/react-pro/calendar';
import { DataGrid, type DataGridColumn } from '@windmorph/react-pro/data-grid';
import { createElement } from 'react';
import { SettingsIcon } from '../../icons';
import { DENSITY_OPTIONS, type PlaygroundDescriptor, asDensity, loose } from './shared';

const ButtonAny = loose(Button);
const DataTableAny = loose(DataTable);
const DataGridAny = loose(DataGrid);
const CalendarAny = loose(Calendar);
const NavigationRailGroupAny = loose(NavigationRailGroup);
const TreeViewAny = loose(TreeView);
const CopyFieldAny = loose(CopyField);
const PopoverAny = loose(Popover);
const TimeFieldAny = loose(TimeField);
const NavigationRailAny = loose(NavigationRail);
const NavigationRailGroupItemAny = loose(NavigationRailGroupItem);
const TreeViewItemContentAny = loose(TreeViewItemContent);
const PopoverTriggerAny = loose(PopoverTrigger);

interface Order {
  id: string;
  customer: string;
  city: string;
  total: number;
}

const ORDERS: Order[] = [
  { id: '1', customer: 'Alex Morgan', city: 'Lyon', total: 120 },
  { id: '2', customer: 'Sam Rivera', city: 'Munich', total: 86 },
  { id: '3', customer: 'Jo Bauer', city: 'Zagreb', total: 240 },
  { id: '4', customer: 'Noor Khan', city: 'Leeds', total: 54 },
];

const ORDER_COLUMNS: ColumnDef<Order>[] = [
  { id: 'customer', header: 'Customer', accessor: (row) => row.customer, rowHeader: true },
  { id: 'city', header: 'City', accessor: (row) => row.city },
  { id: 'total', header: 'Total', accessor: (row) => row.total, type: 'number' },
];

const GRID_COLUMNS: DataGridColumn<Order>[] = [
  { id: 'customer', header: 'Customer', accessor: (row) => row.customer },
  { id: 'city', header: 'City', accessor: (row) => row.city },
  { id: 'total', header: 'Total', accessor: (row) => row.total, type: 'number' },
];

const orderId = (row: Order) => row.id;

const SAMPLE_COLUMNS_CODE = `[
    { id: 'customer', header: 'Customer', accessor: (row) => row.customer, rowHeader: true },
    { id: 'total', header: 'Total', accessor: (row) => row.total, type: 'number' },
  ]`;
const SAMPLE_ROWS_CODE = `[
    { id: '1', customer: 'Alex Morgan', total: 120 },
    { id: '2', customer: 'Sam Rivera', total: 86 },
  ]`;

const CALENDAR_EVENTS: CalendarEventInput[] = [
  {
    id: 'standup',
    title: 'Standup',
    start: '2026-11-11T09:00:00Z',
    end: '2026-11-11T09:30:00Z',
    status: 'Confirmed',
  },
  {
    id: 'review',
    title: 'Design review',
    start: '2026-11-12T13:00:00Z',
    end: '2026-11-12T14:30:00Z',
    color: 'tertiary',
  },
  { id: 'trip', title: 'Conference', allDay: true, start: '2026-11-16', end: '2026-11-18' },
];
const CALENDAR_ZONE = { timeZone: 'UTC', now: '2026-11-11T08:00:00Z' };

interface Folder extends TreeViewNode {
  name: string;
  children?: Folder[];
}

const FOLDERS: Folder[] = [
  {
    id: 'documents',
    name: 'Documents',
    children: [
      { id: 'reports', name: 'Reports' },
      { id: 'notes', name: 'Notes' },
    ],
  },
  { id: 'photos', name: 'Photos' },
];

/** The eight data and navigation pages' playgrounds. */
export const DATA_NAVIGATION_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'data-table': {
    component: 'DataTable',
    importFrom: '@windmorph/react-pro',
    notRendered: {
      DataTableToolbar: 'A part `DataTable` composes for you.',
      DataTableView: 'A part `DataTable` composes for you.',
      DataTablePagination: 'A part `DataTable` composes for you.',
      DataTableFilterChips: 'A part `DataTable` composes for you.',
      DataTableFilterDialog: 'A part `DataTable` composes for you.',
      DataTableColumnSettings: 'A part `DataTable` composes for you.',
    },
    notControlled: {
      defaultState: 'A starting table state, as `state`.',
      compactBelow: 'Off in the narrow preview; the examples turn into a list on a narrow window.',
      filters:
        'Filter fields of your own; the "Search, sort, filter, columns and pages" example shows them.',
      actions: 'Buttons of your own for the toolbar.',
      empty: 'An `EmptyState` of your own, in place of the default.',
      mode: 'Server mode needs a backend; the "Data from a server" example shows it.',
      totalRows: 'Only for server mode; the "Data from a server" example shows it.',
      state: 'A controlled table state, which the "Data from a server" example shows.',
      pageSizes: 'A list of numbers, which the pagination offers.',
      chips: 'A list of chips of your own.',
      icons: 'Replacement icons, one per control.',
    },
    render: ({ density, ...props }) =>
      createElement(
        'div',
        { className: 'w-full' },
        createElement(DataTableAny, {
          ...props,
          'aria-label': 'Orders',
          columns: ORDER_COLUMNS,
          rows: ORDERS,
          getRowId: orderId,
          // The preview is narrow, and a table is what it's here to show.
          compactBelow: false,
          density: asDensity(density),
        }),
      ),
    defaultProps: {
      plain: false,
      selectionMode: 'none',
      maxSortLevels: 3,
      loading: false,
      density: 0,
    },
    surfacedProps: ['plain', 'selectionMode', 'maxSortLevels', 'loading', 'error', 'density'],
    controlKinds: { error: 'string', density: 'number' },
    enumOptions: DENSITY_OPTIONS,
    numberRanges: { maxSortLevels: { min: 1, max: 5, step: 1 } },
    codeSlots: {
      'aria-label': '"Orders"',
      compactBelow: 'false',
      columns: SAMPLE_COLUMNS_CODE,
      rows: SAMPLE_ROWS_CODE,
      getRowId: '(row) => row.id',
    },
  },
  'data-grid': {
    component: 'DataGrid',
    importFrom: '@windmorph/react-pro/data-grid',
    notControlled: {
      defaultSelection: 'A starting range, as `selection`.',
      rowHeight: 'Left to the `row-height` token, so density applies.',
      empty: 'An `EmptyState` of your own, in place of the default.',
      summaryRows:
        'A list of rows of your own; the "A row header, totals and cell states" example shows it.',
      selection: 'A controlled range, made by selecting in the preview.',
      icons: 'Replacement icons, one per control.',
    },
    render: ({ density, ...props }) =>
      createElement(
        'div',
        { className: 'w-full' },
        createElement(DataGridAny, {
          ...props,
          'aria-label': 'Orders',
          columns: GRID_COLUMNS,
          rows: ORDERS,
          getRowId: orderId,
          density: asDensity(density),
        }),
      ),
    defaultProps: {
      editable: false,
      height: 480,
      overscan: 4,
      loading: false,
      density: 0,
    },
    initialState: { editable: true, height: 280 },
    surfacedProps: ['editable', 'height', 'overscan', 'loading', 'error', 'density'],
    controlKinds: { height: 'number', error: 'string', density: 'number' },
    enumOptions: DENSITY_OPTIONS,
    numberRanges: {
      height: { min: 160, max: 480, step: 8 },
      overscan: { min: 0, max: 12, step: 1 },
    },
    codeSlots: {
      'aria-label': '"Orders"',
      columns: SAMPLE_COLUMNS_CODE,
      rows: SAMPLE_ROWS_CODE,
      getRowId: '(row) => row.id',
    },
  },
  calendar: {
    component: 'Calendar',
    importFrom: '@windmorph/react-pro/calendar',
    notRendered: {
      CalendarToolbar: 'A part `Calendar` composes for you; pass `toolbar` to replace it.',
      CalendarMonthView: 'A part `Calendar` composes for you.',
      CalendarTimeGridView: 'A part `Calendar` composes for you.',
      CalendarAgendaView: 'A part `Calendar` composes for you.',
      CalendarTimelineView: 'A part `Calendar` composes for you.',
      CalendarEvent: 'Every event is one; `renderEvent` replaces its content.',
    },
    notControlled: {
      defaultDate: 'The first period shown, as `date`.',
      empty: 'Content of your own for an agenda with nothing in it.',
      resources: 'A list of your own; the "Rooms: a schedule and a timeline" example shows it.',
      date: 'The period shown, which the toolbar changes in the preview.',
      views: 'A list of views; the "Rooms: a schedule and a timeline" example shows it.',
      timeZone: 'Fixed in the preview, so its events keep their times.',
      now: 'Fixed in the preview, so the sample week is the one shown.',
      calendar: 'A calendar system’s identifier, which most apps take from the locale.',
      visibleHours: 'A pair of hours, which the time views show.',
      businessHours: 'A list of your own; the "Rooms: a schedule and a timeline" example shows it.',
      blockedRanges: 'A list of your own; the "Rooms: a schedule and a timeline" example shows it.',
      icons: 'Replacement icons, one per control.',
    },
    render: ({ density, firstDayOfWeek, ...props }) =>
      createElement(
        'div',
        { className: 'w-full' },
        createElement(CalendarAny, {
          ...props,
          ...CALENDAR_ZONE,
          'aria-label': 'Bookings',
          events: CALENDAR_EVENTS,
          firstDayOfWeek: firstDayOfWeek ?? undefined,
          density: asDensity(density),
        }),
      ),
    defaultProps: {
      view: 'month',
      firstDayOfWeek: undefined,
      slotDuration: 30,
      timelineUnit: 'hour',
      scheduleDays: 1,
      agendaDays: 30,
      maxEventsPerDay: 3,
      loading: false,
      density: 0,
    },
    surfacedProps: [
      'view',
      'firstDayOfWeek',
      'slotDuration',
      'timelineUnit',
      'scheduleDays',
      'agendaDays',
      'maxEventsPerDay',
      'loading',
      'density',
    ],
    enumOptions: DENSITY_OPTIONS,
    controlKinds: { density: 'number' },
    numberRanges: {
      slotDuration: { min: 5, max: 60, step: 5 },
      scheduleDays: { min: 1, max: 7, step: 1 },
      agendaDays: { min: 7, max: 60, step: 1 },
      maxEventsPerDay: { min: 1, max: 6, step: 1 },
    },
    codeSlots: {
      'aria-label': '"Bookings"',
      events:
        "[{ id: 'standup', title: 'Standup', start: '2026-11-11T09:00:00Z', end: '2026-11-11T09:30:00Z' }]",
    },
  },
  'navigation-rail-group': {
    component: 'NavigationRailGroup',
    importFrom: '@windmorph/react-pro',
    notRendered: {
      NavigationRailGroupItem: 'The column’s links, composed in the preview.',
    },
    notControlled: {
      href: 'A link for the destination, which the preview leaves to its first item.',
      currentPath: 'Sampled in the preview, so Sales is the current page.',
    },
    render: (props) =>
      createElement(
        'div',
        { className: 'relative flex h-[320px] w-full overflow-hidden' },
        createElement(
          NavigationRailAny,
          { 'aria-label': 'Playground sections', className: 'h-full' },
          createElement(
            NavigationRailGroupAny,
            {
              ...props,
              id: 'reports',
              icon: createElement(SettingsIcon),
              currentPath: '/reports/sales',
            },
            createElement(NavigationRailGroupItemAny, { href: '/reports/sales' }, 'Sales'),
            createElement(NavigationRailGroupItemAny, { href: '/reports/costs' }, 'Costs'),
          ),
        ),
      ),
    defaultProps: { pinned: false, open: false, openDelay: 60, closeDelay: 250 },
    initialState: { label: 'Reports', heading: 'Reports' },
    surfacedProps: ['label', 'heading', 'pinned', 'open', 'openDelay', 'closeDelay'],
    numberRanges: {
      openDelay: { min: 0, max: 500, step: 10 },
      closeDelay: { min: 0, max: 1000, step: 10 },
    },
    importMembers: ['NavigationRailGroupItem'],
    codeSlots: { id: '"reports"', icon: '<SettingsIcon />' },
    codeChildren:
      '\n  <NavigationRailGroupItem href="/reports/sales">Sales</NavigationRailGroupItem>\n',
  },
  'tree-view': {
    component: 'TreeView',
    importFrom: '@windmorph/react-pro',
    notRendered: { TreeViewItemContent: 'A row’s content, composed in the preview.' },
    notControlled: {
      defaultExpandedKeys: 'Sampled in the preview, so Documents starts open.',
      defaultSelectedKeys: 'A starting set of keys, as `selectedKeys`.',
      expandedKeys: 'A controlled set of keys, made by opening rows in the preview.',
      selectedKeys: 'A controlled set of keys, made by selecting rows in the preview.',
      disabledKeys:
        'A set of keys of your own; the "Selection, with a disabled row" example shows it.',
      expandIcon: 'A replacement icon.',
      empty: 'Content for a tree with no rows.',
    },
    render: ({ density, ...props }) =>
      createElement(TreeViewAny, {
        ...props,
        'aria-label': 'Files',
        className: 'w-full max-w-sm',
        items: FOLDERS,
        textValue: (node: Folder) => node.name,
        defaultExpandedKeys: ['documents'],
        density: asDensity(density),
        children: (node: Folder) => createElement(TreeViewItemContentAny, { title: node.name }),
      }),
    defaultProps: { selectionMode: 'none', density: 0 },
    surfacedProps: ['selectionMode', 'density'],
    enumOptions: DENSITY_OPTIONS,
    controlKinds: { density: 'number' },
    codeSlots: {
      'aria-label': '"Files"',
      items: "[{ id: 'photos', name: 'Photos' }]",
      textValue: '(node) => node.name',
    },
    importMembers: ['TreeViewItemContent'],
    codeChildren: '{(node) => <TreeViewItemContent title={node.name} />}',
  },
  'copy-field': {
    component: 'CopyField',
    importFrom: '@windmorph/react-pro',
    notControlled: {
      copyValue:
        'For a masked value; the "Copying something other than what shows" example shows it.',
      copyIcon: 'A replacement icon.',
      copiedIcon: 'A replacement icon.',
      errorIcon: 'A replacement icon.',
    },
    render: ({ density, ...props }) =>
      createElement(CopyFieldAny, {
        ...props,
        className: 'w-full max-w-sm',
        value: 'https://example.com/invite/4f2a',
        density: asDensity(density),
      }),
    defaultProps: {
      variant: 'outlined',
      density: 0,
      disabled: false,
      confirmationDuration: 2000,
    },
    initialState: { label: 'Invite link' },
    surfacedProps: [
      'label',
      'supportingText',
      'variant',
      'density',
      'disabled',
      'confirmationDuration',
    ],
    enumOptions: DENSITY_OPTIONS,
    controlKinds: { density: 'number' },
    numberRanges: { confirmationDuration: { min: 500, max: 5000, step: 100 } },
    codeSlots: { value: '"https://example.com/invite/4f2a"' },
  },
  popover: {
    component: 'Popover',
    importFrom: '@windmorph/react-pro',
    notRendered: { PopoverTrigger: 'Wraps the button in the preview.' },
    notControlled: {
      defaultOpen: 'Pressing the preview’s button opens it.',
      open: 'Pressing the preview’s button opens it.',
    },
    render: (props) =>
      createElement(
        PopoverTriggerAny,
        null,
        createElement(ButtonAny, { variant: 'tonal' }, 'Account'),
        createElement(
          PopoverAny,
          { ...props, 'aria-label': 'Account' },
          createElement(
            'p',
            { className: 'm-0 text-body-medium text-on-surface' },
            'Signed in as Alex Morgan',
          ),
        ),
      ),
    defaultProps: {
      placement: 'bottom-start',
      offset: 4,
      crossOffset: 0,
      closedBy: 'any',
      fullScreenOnCompact: true,
    },
    initialState: { headline: 'Account' },
    surfacedProps: [
      'headline',
      'placement',
      'offset',
      'crossOffset',
      'closedBy',
      'fullScreenOnCompact',
    ],
    numberRanges: {
      offset: { min: 0, max: 24, step: 1 },
      crossOffset: { min: -24, max: 24, step: 1 },
    },
    codeImports: ["import { Button } from '@windmorph/react';"],
    importMembers: ['PopoverTrigger'],
    codeSlots: { 'aria-label': '"Account"' },
    codeWrap: {
      before: '<PopoverTrigger>\n  <Button variant="tonal">Account</Button>',
      after: '</PopoverTrigger>',
    },
    codeChildren: '<p>Signed in as Alex Morgan</p>',
  },
  'time-field': {
    component: 'TimeField',
    notControlled: {
      defaultValue: 'A starting time, as `value`.',
      defaultOpen: 'Pressing the preview’s clock opens it.',
      value: 'A time, which typing in the preview changes.',
      min: 'A time; the "Controlled, with limits" example shows it.',
      max: 'A time; the "Controlled, with limits" example shows it.',
      open: 'Pressing the preview’s clock opens it.',
      name: 'For a form.',
      clockIcon: 'A replacement icon.',
    },
    render: ({ density, hourCycle, ...props }) =>
      createElement(TimeFieldAny, {
        ...props,
        className: 'w-full max-w-xs',
        hourCycle: hourCycle == null ? undefined : Number(hourCycle),
        density: asDensity(density),
      }),
    defaultProps: {
      variant: 'outlined',
      invalid: false,
      required: false,
      disabled: false,
      readOnly: false,
      density: 0,
    },
    initialState: { label: 'Start' },
    surfacedProps: [
      'label',
      'supportingText',
      'errorMessage',
      'variant',
      'hourCycle',
      'invalid',
      'required',
      'disabled',
      'readOnly',
      'density',
    ],
    enumOptions: { ...DENSITY_OPTIONS, hourCycle: ['12', '24'] },
    controlKinds: { density: 'number', hourCycle: 'number' },
  },
};
