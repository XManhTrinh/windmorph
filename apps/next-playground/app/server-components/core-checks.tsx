import * as Core from '@windmorph/react';
import { collection, hook, read, type ExportChecks } from './check';

/** A plain icon; an element made on the server passes to client components as props. */
function Glyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

const icon = <Glyph />;
const spring = Core.SPRINGS.expressive.spatial.default;
const tokens = Core.defineComponentTokens({
  name: 'sample-chip',
  tokens: {
    'container-color': {
      value: Core.color('secondary-container'),
      description: 'Container colour.',
    },
  },
});

/** Every value export of `@windmorph/react`, checked from a server component. */
export const coreChecks = {
  // Theming
  ThemeProvider: {
    kind: 'component',
    render: () => (
      <Core.ThemeProvider>
        <span>Nested provider</span>
      </Core.ThemeProvider>
    ),
  },
  ThemeScope: {
    kind: 'component',
    render: () => (
      <Core.ThemeScope theme="forest" mode="dark" className="bg-surface p-2 text-on-surface">
        Forest, dark
      </Core.ThemeScope>
    ),
  },
  ThemeScript: { kind: 'component', render: () => <Core.ThemeScript /> },
  getThemeScriptSource: { kind: 'value', run: () => Core.getThemeScriptSource() },
  useTheme: hook,
  useThemeScope: hook,
  createTheme: { kind: 'value', run: () => Core.createTheme({ name: 'harbour', seed: '#0B57D0' }) },
  DEFAULT_STORAGE_KEY: read(Core.DEFAULT_STORAGE_KEY),
  DEFAULT_THEME_STATE: read(Core.DEFAULT_THEME_STATE),
  parseThemeState: { kind: 'value', run: () => Core.parseThemeState('theme=ocean&mode=dark') },
  serializeThemeState: {
    kind: 'value',
    run: () => Core.serializeThemeState(Core.DEFAULT_THEME_STATE),
  },
  themeAttributes: { kind: 'value', run: () => Core.themeAttributes(Core.DEFAULT_THEME_STATE) },

  // Motion
  getM3Spring: { kind: 'value', run: () => Core.getM3Spring('expressive', 'spatial', 'fast') },
  useM3Spring: hook,

  // Utilities
  cn: { kind: 'value', run: () => Core.cn('p-2 text-primary', 'p-4') },
  twMergeConfig: read(Core.twMergeConfig),
  tv: { kind: 'value', run: () => Core.tv({ base: 'p-4' })() },
  matchesSearch: { kind: 'value', run: () => Core.matchesSearch('Zürich', 'zurich') },
  normalizeSearch: { kind: 'value', run: () => Core.normalizeSearch('Crème brûlée') },

  // Tokens
  BREAKPOINTS: read(Core.BREAKPOINTS),
  BREAKPOINT_NAMES: read(Core.BREAKPOINT_NAMES),
  BUILT_IN_THEMES: read(Core.BUILT_IN_THEMES),
  BUILT_IN_THEME_NAMES: read(Core.BUILT_IN_THEME_NAMES),
  COLOR_MODES: read(Core.COLOR_MODES),
  COLOR_ROLES: read(Core.COLOR_ROLES),
  CONTRAST_LEVELS: read(Core.CONTRAST_LEVELS),
  CONTRAST_LEVEL_NAMES: read(Core.CONTRAST_LEVEL_NAMES),
  CORNERS: read(Core.CORNERS),
  CORNER_NAMES: read(Core.CORNER_NAMES),
  CUSTOM_COLORS: read(Core.CUSTOM_COLORS),
  CUSTOM_COLOR_ROLES: read(Core.CUSTOM_COLOR_ROLES),
  DEFAULT_CUSTOM_COLORS: read(Core.DEFAULT_CUSTOM_COLORS),
  DEFAULT_MOTION_SCHEME: read(Core.DEFAULT_MOTION_SCHEME),
  DEFAULT_THEME: read(Core.DEFAULT_THEME),
  ELEVATION_LEVELS: read(Core.ELEVATION_LEVELS),
  ELEVATION_LEVEL_NAMES: read(Core.ELEVATION_LEVEL_NAMES),
  FOCUS_INDICATOR: read(Core.FOCUS_INDICATOR),
  LEGACY_DURATIONS: read(Core.LEGACY_DURATIONS),
  LEGACY_EASINGS: read(Core.LEGACY_EASINGS),
  MOTION_SCHEMES: read(Core.MOTION_SCHEMES),
  PALETTE_NAMES: read(Core.PALETTE_NAMES),
  SCHEME_VARIANTS: read(Core.SCHEME_VARIANTS),
  SHADOW_AMBIENT_OPACITY: read(Core.SHADOW_AMBIENT_OPACITY),
  SHADOW_KEY_OPACITY: read(Core.SHADOW_KEY_OPACITY),
  SPRINGS: read(Core.SPRINGS),
  SPRING_FAMILIES: read(Core.SPRING_FAMILIES),
  SPRING_SPEEDS: read(Core.SPRING_SPEEDS),
  SPRING_TOKEN_NAMES: read(Core.SPRING_TOKEN_NAMES),
  STATE_OPACITIES: read(Core.STATE_OPACITIES),
  TYPEFACES: read(Core.TYPEFACES),
  TYPE_ROLES: read(Core.TYPE_ROLES),
  TYPE_SCALE: read(Core.TYPE_SCALE),
  Z_INDEX: read(Core.Z_INDEX),
  springPosition: { kind: 'value', run: () => Core.springPosition(spring, 0.1) },
  springSettleDuration: { kind: 'value', run: () => Core.springSettleDuration(spring) },
  springToLinearEasing: { kind: 'value', run: () => Core.springToLinearEasing(spring) },
  toMotionSpring: { kind: 'value', run: () => Core.toMotionSpring(spring) },

  // Component tokens
  color: { kind: 'value', run: () => Core.color('primary') },
  colorAt: { kind: 'value', run: () => Core.colorAt('on-surface', 0.38) },
  componentTokenList: { kind: 'value', run: () => Core.componentTokenList(Core.cardTokenSet) },
  componentTokensCss: { kind: 'value', run: () => Core.componentTokensCss(tokens) },
  corner: { kind: 'value', run: () => Core.corner('large') },
  defineComponentTokens: { kind: 'value', run: () => tokens },
  elevation: { kind: 'value', run: () => Core.elevation(1) },
  isComponentTokenSet: { kind: 'value', run: () => Core.isComponentTokenSet(Core.cardTokenSet) },
  px: { kind: 'value', run: () => Core.px(56) },
  spring: { kind: 'value', run: () => Core.spring('spatial', 'fast', 'easing') },
  typeTokens: { kind: 'value', run: () => Core.typeTokens('body-large') },
  typescale: { kind: 'value', run: () => Core.typescale('body-large', 'size') },

  // Components
  Button: { kind: 'component', render: () => <Core.Button>Save</Core.Button> },
  ButtonContext: {
    kind: 'context',
    render: () => (
      <Core.ButtonContext value={{ variant: 'tonal' }}>
        <Core.Button>Tonal from context</Core.Button>
      </Core.ButtonContext>
    ),
  },
  ToggleGroupStateContext: {
    kind: 'context',
    render: () => (
      <Core.ToggleGroupStateContext value={null}>
        <Core.Button>Outside a group</Core.Button>
      </Core.ToggleGroupStateContext>
    ),
  },
  buttonStyles: { kind: 'value', run: () => Core.buttonStyles() },
  buttonVariantClasses: read(Core.buttonVariantClasses),
  IconButton: {
    kind: 'component',
    render: () => <Core.IconButton icon={icon} aria-label="Favourite" />,
  },
  iconButtonStyles: { kind: 'value', run: () => Core.iconButtonStyles() },

  // Composites
  ButtonGroup: {
    kind: 'component',
    render: () => (
      <Core.ButtonGroup aria-label="Text alignment">
        <Core.Button variant="tonal">Left</Core.Button>
        <Core.Button variant="tonal">Right</Core.Button>
      </Core.ButtonGroup>
    ),
  },
  buttonGroupStyles: { kind: 'value', run: () => Core.buttonGroupStyles() },

  ExtendedFab: {
    kind: 'component',
    render: () => <Core.ExtendedFab icon={icon}>Compose</Core.ExtendedFab>,
  },
  Fab: { kind: 'component', render: () => <Core.Fab icon={icon} aria-label="Compose" /> },
  extendedFabStyles: { kind: 'value', run: () => Core.extendedFabStyles() },
  fabStyles: { kind: 'value', run: () => Core.fabStyles() },

  CircularProgressIndicator: {
    kind: 'component',
    render: () => <Core.CircularProgressIndicator value={0.4} aria-label="Uploading" />,
  },
  LinearProgressIndicator: {
    kind: 'component',
    render: () => <Core.LinearProgressIndicator value={0.4} aria-label="Uploading" />,
  },
  circularProgressStyles: { kind: 'value', run: () => Core.circularProgressStyles() },
  linearProgressStyles: { kind: 'value', run: () => Core.linearProgressStyles() },
  PullToRefresh: { kind: 'client', reason: 'its onRefresh prop is a function' },
  pullToRefreshStyles: { kind: 'value', run: () => Core.pullToRefreshStyles() },

  Tooltip: {
    kind: 'component',
    render: () => (
      <Core.TooltipTrigger>
        <Core.Button>Save</Core.Button>
        <Core.Tooltip>Save to your library</Core.Tooltip>
      </Core.TooltipTrigger>
    ),
  },
  TooltipTrigger: {
    kind: 'component',
    render: () => (
      <Core.TooltipTrigger>
        <Core.IconButton icon={icon} aria-label="Favourite" />
        <Core.Tooltip>Add to favourites</Core.Tooltip>
      </Core.TooltipTrigger>
    ),
  },
  RichTooltip: {
    kind: 'component',
    render: () => (
      <Core.RichTooltipTrigger>
        <Core.Button>Sharing</Core.Button>
        <Core.RichTooltip title="Shared folder">Everyone can edit.</Core.RichTooltip>
      </Core.RichTooltipTrigger>
    ),
  },
  RichTooltipTrigger: {
    kind: 'component',
    render: () => (
      <Core.RichTooltipTrigger>
        <Core.IconButton icon={icon} aria-label="About sharing" />
        <Core.RichTooltip title="Shared folder">Everyone can edit.</Core.RichTooltip>
      </Core.RichTooltipTrigger>
    ),
  },
  TooltipPlacementContext: {
    kind: 'context',
    render: () => (
      <Core.TooltipPlacementContext value="bottom">
        <span>Tooltips below</span>
      </Core.TooltipPlacementContext>
    ),
  },
  richTooltipStyles: { kind: 'value', run: () => Core.richTooltipStyles() },
  tooltipStyles: { kind: 'value', run: () => Core.tooltipStyles() },

  Snackbar: { kind: 'component', render: () => <Core.Snackbar>Photo saved</Core.Snackbar> },
  SnackbarHost: { kind: 'client', reason: 'its state prop is a SnackbarHostState instance' },
  SnackbarHostState: { kind: 'value', run: () => new Core.SnackbarHostState() },
  useSnackbarHostState: hook,
  snackbarHostStyles: { kind: 'value', run: () => Core.snackbarHostStyles() },
  snackbarStyles: { kind: 'value', run: () => Core.snackbarStyles() },

  NavigationRail: {
    kind: 'component',
    render: () => (
      <Core.NavigationRail aria-label="Main">
        <Core.NavigationRailItem icon={icon} selected>
          Home
        </Core.NavigationRailItem>
      </Core.NavigationRail>
    ),
  },
  NavigationRailItem: {
    kind: 'component',
    render: () => (
      <Core.NavigationRail aria-label="Shortcuts">
        <Core.NavigationRailItem icon={icon} href="#starred">
          Starred
        </Core.NavigationRailItem>
      </Core.NavigationRail>
    ),
  },
  NavigationBar: {
    kind: 'component',
    render: () => (
      <Core.NavigationBar aria-label="Main">
        <Core.NavigationBarItem icon={icon} selected>
          Home
        </Core.NavigationBarItem>
      </Core.NavigationBar>
    ),
  },
  NavigationBarItem: {
    kind: 'component',
    render: () => (
      <Core.NavigationBar aria-label="Sections">
        <Core.NavigationBarItem icon={icon} href="#search">
          Search
        </Core.NavigationBarItem>
      </Core.NavigationBar>
    ),
  },
  navItemStyles: { kind: 'value', run: () => Core.navItemStyles() },
  navigationBarStyles: { kind: 'value', run: () => Core.navigationBarStyles() },
  navigationRailStyles: { kind: 'value', run: () => Core.navigationRailStyles() },

  Tabs: { kind: 'client', reason: 'its Tab items form a collection' },
  Tab: collection('Tabs'),
  tabsStyles: { kind: 'value', run: () => Core.tabsStyles() },

  AssistChip: {
    kind: 'component',
    render: () => <Core.AssistChip>Add to calendar</Core.AssistChip>,
  },
  FilterChip: { kind: 'component', render: () => <Core.FilterChip>Open now</Core.FilterChip> },
  InputChip: { kind: 'component', render: () => <Core.InputChip>Priya</Core.InputChip> },
  SuggestionChip: {
    kind: 'component',
    render: () => <Core.SuggestionChip>See you soon</Core.SuggestionChip>,
  },
  ChipSet: {
    kind: 'component',
    render: () => (
      <Core.ChipSet aria-label="Filters">
        <Core.FilterChip>Open now</Core.FilterChip>
        <Core.FilterChip>Top rated</Core.FilterChip>
      </Core.ChipSet>
    ),
  },
  chipSetStyles: { kind: 'value', run: () => Core.chipSetStyles() },
  chipStyles: { kind: 'value', run: () => Core.chipStyles() },

  SplitButton: { kind: 'client', reason: 'its menu prop holds Menu collection items' },
  splitButtonStyles: { kind: 'value', run: () => Core.splitButtonStyles() },

  FabMenu: {
    kind: 'component',
    render: () => (
      <Core.FabMenu icon={icon} aria-label="Create">
        <Core.FabMenuItem icon={icon}>Edit</Core.FabMenuItem>
        <Core.FabMenuItem icon={icon}>Delete</Core.FabMenuItem>
      </Core.FabMenu>
    ),
  },
  FabMenuItem: {
    kind: 'component',
    render: () => (
      <Core.FabMenu icon={icon} aria-label="Share">
        <Core.FabMenuItem icon={icon}>Send</Core.FabMenuItem>
        <Core.FabMenuItem icon={icon}>Copy link</Core.FabMenuItem>
      </Core.FabMenu>
    ),
  },
  fabMenuStyles: { kind: 'value', run: () => Core.fabMenuStyles() },

  LoadingIndicator: {
    kind: 'component',
    render: () => <Core.LoadingIndicator aria-label="Loading" />,
  },
  loadingIndicatorStyles: { kind: 'value', run: () => Core.loadingIndicatorStyles() },

  Card: {
    kind: 'component',
    render: () => (
      <Core.Card variant="outlined" className="p-4">
        Bánh mì for two
      </Core.Card>
    ),
  },
  cardStyles: { kind: 'value', run: () => Core.cardStyles() },
  cardTokenSet: read(Core.cardTokenSet),

  TextField: { kind: 'component', render: () => <Core.TextField label="Name" /> },
  textFieldStyles: { kind: 'value', run: () => Core.textFieldStyles() },
  textFieldTokenSet: read(Core.textFieldTokenSet),
  Select: { kind: 'client', reason: 'its SelectItem items form a collection' },
  SelectItem: collection('Select'),
  SelectSection: collection('Select'),
  Autocomplete: { kind: 'client', reason: 'its AutocompleteItem items form a collection' },
  AutocompleteItem: collection('Autocomplete'),
  AutocompleteSection: collection('Autocomplete'),
  OptionPopover: { kind: 'client', reason: 'its state and refs come from React Stately' },

  Checkbox: { kind: 'component', render: () => <Core.Checkbox>Remember me</Core.Checkbox> },
  checkboxStyles: { kind: 'value', run: () => Core.checkboxStyles() },
  checkboxTokenSet: read(Core.checkboxTokenSet),
  RadioGroup: {
    kind: 'component',
    render: () => (
      <Core.RadioGroup label="Delivery" defaultValue="standard">
        <Core.Radio value="standard">Standard</Core.Radio>
        <Core.Radio value="express">Express</Core.Radio>
      </Core.RadioGroup>
    ),
  },
  Radio: {
    kind: 'component',
    render: () => (
      <Core.RadioGroup label="Size">
        <Core.Radio value="small">Small</Core.Radio>
      </Core.RadioGroup>
    ),
  },
  radioGroupStyles: { kind: 'value', run: () => Core.radioGroupStyles() },
  radioStyles: { kind: 'value', run: () => Core.radioStyles() },
  radioTokenSet: read(Core.radioTokenSet),
  Switch: { kind: 'component', render: () => <Core.Switch>Wi-Fi</Core.Switch> },
  switchStyles: { kind: 'value', run: () => Core.switchStyles() },
  switchTokenSet: read(Core.switchTokenSet),

  Dialog: {
    kind: 'component',
    render: () => (
      <Core.DialogTrigger>
        <Core.Button>Reset settings</Core.Button>
        <Core.Dialog>
          <Core.DialogTitle>Reset all settings?</Core.DialogTitle>
          <Core.DialogContent>This returns every setting to its default.</Core.DialogContent>
        </Core.Dialog>
      </Core.DialogTrigger>
    ),
  },
  DialogTrigger: {
    kind: 'component',
    render: () => (
      <Core.DialogTrigger>
        <Core.Button>Open</Core.Button>
        <Core.Dialog aria-label="Details">Details</Core.Dialog>
      </Core.DialogTrigger>
    ),
  },
  DialogHeader: {
    kind: 'component',
    render: () => <Core.DialogHeader closeLabel="Close">Edit profile</Core.DialogHeader>,
  },
  DialogTitle: { kind: 'component', render: () => <Core.DialogTitle>Title</Core.DialogTitle> },
  DialogContent: {
    kind: 'component',
    render: () => <Core.DialogContent>Content</Core.DialogContent>,
  },
  DialogActions: {
    kind: 'component',
    render: () => (
      <Core.DialogActions>
        <Core.Button variant="text">Done</Core.Button>
      </Core.DialogActions>
    ),
  },
  dialogStyles: { kind: 'value', run: () => Core.dialogStyles() },

  Menu: { kind: 'client', reason: 'its MenuItem items form a collection' },
  MenuItem: collection('Menu'),
  MenuGroup: collection('Menu'),
  MenuTrigger: { kind: 'client', reason: 'its Menu items form a collection' },
  SubmenuTrigger: collection('Menu'),
  ContextMenuTrigger: { kind: 'client', reason: 'its Menu items form a collection' },
  menuStyles: { kind: 'value', run: () => Core.menuStyles() },

  DockedToolbar: {
    kind: 'component',
    render: () => (
      <Core.DockedToolbar aria-label="Message actions">
        <Core.IconButton icon={icon} aria-label="Archive" />
      </Core.DockedToolbar>
    ),
  },
  FloatingToolbar: {
    kind: 'component',
    render: () => (
      <Core.FloatingToolbar aria-label="Formatting">
        <Core.IconButton icon={icon} aria-label="Bold" />
      </Core.FloatingToolbar>
    ),
  },
  ToolbarFab: {
    kind: 'component',
    render: () => (
      <Core.FloatingToolbar
        aria-label="Quick actions"
        fab={<Core.ToolbarFab icon={icon} aria-label="Compose" />}
      >
        <Core.IconButton icon={icon} aria-label="Search" />
      </Core.FloatingToolbar>
    ),
  },
  dockedToolbarStyles: { kind: 'value', run: () => Core.dockedToolbarStyles() },
  floatingToolbarStyles: { kind: 'value', run: () => Core.floatingToolbarStyles() },
  toolbarFabStyles: { kind: 'value', run: () => Core.toolbarFabStyles() },
  useToolbarScrollExit: hook,
  useToolbarScrollExpansion: hook,

  TopAppBar: { kind: 'component', render: () => <Core.TopAppBar title="Inbox" /> },
  topAppBarStyles: { kind: 'value', run: () => Core.topAppBarStyles() },
  SearchBar: {
    kind: 'component',
    render: () => <Core.SearchBar aria-label="Search" placeholder="Search" />,
  },
  SearchAppBar: {
    kind: 'component',
    render: () => (
      <Core.SearchAppBar>
        <Core.SearchBar aria-label="Search mail" placeholder="Search mail" />
      </Core.SearchAppBar>
    ),
  },
  searchAppBarStyles: { kind: 'value', run: () => Core.searchAppBarStyles() },
  searchBarStyles: { kind: 'value', run: () => Core.searchBarStyles() },

  Divider: { kind: 'component', render: () => <Core.Divider /> },
  LabeledDivider: {
    kind: 'component',
    render: () => <Core.LabeledDivider>Earlier this week</Core.LabeledDivider>,
  },
  dividerStyles: { kind: 'value', run: () => Core.dividerStyles() },
  labeledDividerStyles: { kind: 'value', run: () => Core.labeledDividerStyles() },

  Badge: { kind: 'component', render: () => <Core.Badge>3</Core.Badge> },
  BadgedBox: {
    kind: 'component',
    render: () => (
      <Core.BadgedBox badge={<Core.Badge>3</Core.Badge>}>
        <Glyph />
      </Core.BadgedBox>
    ),
  },
  badgedBoxStyles: { kind: 'value', run: () => Core.badgedBoxStyles() },
  badgeStyles: { kind: 'value', run: () => Core.badgeStyles() },

  List: {
    kind: 'component',
    render: () => (
      <Core.List aria-label="Settings">
        <Core.ListItem key="general">General</Core.ListItem>
      </Core.List>
    ),
  },
  ListItem: {
    kind: 'component',
    render: () => (
      <Core.List aria-label="Contacts">
        <Core.ListItem key="sam" supportingText="Online">
          Sam
        </Core.ListItem>
      </Core.List>
    ),
  },
  ListSection: {
    kind: 'component',
    render: () => (
      <Core.List aria-label="Preferences">
        <Core.ListSection key="network" title="Network">
          <Core.ListItem key="wifi">Wi-Fi</Core.ListItem>
        </Core.ListSection>
      </Core.List>
    ),
  },
  ListItemAvatar: {
    kind: 'component',
    render: () => (
      <Core.List aria-label="People">
        <Core.ListItem key="alex" leading={<Core.ListItemAvatar>AM</Core.ListItemAvatar>}>
          Alex Müller
        </Core.ListItem>
      </Core.List>
    ),
  },
  ListItemImage: {
    kind: 'component',
    render: () => (
      <Core.List aria-label="Photos">
        <Core.ListItem key="coast" leading={<Core.ListItemImage alt="" fallback={<Glyph />} />}>
          Coast
        </Core.ListItem>
      </Core.List>
    ),
  },
  ListItemVideo: {
    kind: 'component',
    render: () => (
      <Core.List aria-label="Videos">
        <Core.ListItem key="clip" leading={<Core.ListItemVideo alt="" fallback={<Glyph />} />}>
          Clip
        </Core.ListItem>
      </Core.List>
    ),
  },
  listMediaStyles: { kind: 'value', run: () => Core.listMediaStyles() },
  listStyles: { kind: 'value', run: () => Core.listStyles() },

  Slider: {
    kind: 'component',
    render: () => <Core.Slider aria-label="Volume" defaultValue={40} />,
  },
  RangeSlider: {
    kind: 'component',
    render: () => <Core.RangeSlider aria-label="Price" defaultValue={[20, 80]} />,
  },
  sliderStyles: { kind: 'value', run: () => Core.sliderStyles() },
  sliderTokenSet: read(Core.sliderTokenSet),

  SheetTrigger: {
    kind: 'component',
    render: () => (
      <Core.SheetTrigger>
        <Core.Button>Show details</Core.Button>
        <Core.BottomSheet aria-label="Details">Details</Core.BottomSheet>
      </Core.SheetTrigger>
    ),
  },
  BottomSheet: {
    kind: 'component',
    render: () => (
      <Core.BottomSheet
        variant="standard"
        aria-label="Now playing"
        classNames={{ container: 'absolute' }}
      >
        Now playing
      </Core.BottomSheet>
    ),
  },
  SideSheet: {
    kind: 'component',
    render: () => (
      <Core.SideSheet variant="standard" aria-label="Filters">
        Filters
      </Core.SideSheet>
    ),
  },
  bottomSheetStyles: { kind: 'value', run: () => Core.bottomSheetStyles() },
  sideSheetStyles: { kind: 'value', run: () => Core.sideSheetStyles() },

  Carousel: {
    kind: 'component',
    render: () => (
      <Core.Carousel aria-label="Albums" className="h-[120px]">
        <div className="size-full bg-primary-container">Coast</div>
        <div className="size-full bg-secondary-container">Mountains</div>
      </Core.Carousel>
    ),
  },
  carouselStyles: { kind: 'value', run: () => Core.carouselStyles() },

  DatePicker: { kind: 'component', render: () => <Core.DatePicker aria-label="Date" /> },
  DateRangePicker: {
    kind: 'component',
    render: () => <Core.DateRangePicker aria-label="Dates" />,
  },
  datePickerStyles: { kind: 'value', run: () => Core.datePickerStyles() },
  dockedDatePickerStyles: { kind: 'value', run: () => Core.dockedDatePickerStyles() },
  DateField: { kind: 'component', render: () => <Core.DateField label="Date" /> },
  PickerDialog: {
    kind: 'component',
    render: () => (
      <Core.PickerDialog
        aria-label="Select date"
        confirmButton={<Core.Button variant="text">OK</Core.Button>}
      >
        <Core.DatePicker aria-label="Date" />
      </Core.PickerDialog>
    ),
  },
  pickerDialogStyles: { kind: 'value', run: () => Core.pickerDialogStyles() },
  TimePicker: { kind: 'component', render: () => <Core.TimePicker aria-label="Time" /> },
  TimePickerModeToggle: { kind: 'client', reason: 'its onModeChange prop is a function' },
  useTimePickerRoom: hook,
  timePickerStyles: { kind: 'value', run: () => Core.timePickerStyles() },
} satisfies ExportChecks<typeof Core>;
