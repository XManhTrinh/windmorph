import { AutocompleteBody } from './autocomplete';
import { AvatarBody } from './avatar';
import { BadgeBody } from './badge';
import { ButtonBody } from './button';
import { ButtonGroupBody } from './button-group';
import { CardBody } from './card';
import { CarouselBody } from './carousel';
import { CheckboxBody } from './checkbox';
import { ChipsBody } from './chips';
import { DatePickerBody } from './date-picker';
import { DialogBody } from './dialog';
import { DividerBody } from './divider';
import { FabBody } from './fab';
import { FabMenuBody } from './fab-menu';
import { IconButtonBody } from './icon-button';
import { ListBody } from './list';
import { LoadingIndicatorBody } from './loading-indicator';
import { MenuBody } from './menu';
import { NavigationBarBody } from './navigation-bar';
import { NavigationRailBody } from './navigation-rail';
import { EmptyStateBody } from './empty-state';
import { ListDetailLayoutBody } from './list-detail-layout';
import { AlertBody } from './alert';
import { ImageCropBody } from './image-crop';
import { MediaUploadGridBody } from './media-upload-grid';
import { MediaViewerBody } from './media-viewer';
import { LinkBody } from './link';
import { FileTriggerBody } from './file-trigger';
import { SkipLinkBody } from './skip-link';
import { ShapedIconBody } from './shaped-icon';
import { CollapseBody } from './collapse';
import { CommentRowBody } from './comment-row';
import { LoadMoreBody } from './load-more';
import { MediaGridBody } from './media-grid';
import { ReactionSummaryBody } from './reaction-summary';
import { ExpandableTextBody } from './expandable-text';
import { ReactionPickerBody } from './reaction-picker';
import { MessageFieldBody } from './message-field';
import { RichMessageFieldBody } from './rich-message-field';
import { PhoneFieldBody } from './phone-field';
import { SelectBody } from './select';
import { PickerDialogBody } from './picker-dialog';
import { PinInputBody } from './pin-input';
import { PrimitivesBody } from './primitives';
import { ProgressBody } from './progress';
import { PullToRefreshBody } from './pull-to-refresh';
import { RadioGroupBody } from './radio-group';
import { SearchBody } from './search';
import { SheetsBody } from './sheets';
import { SkeletonBody } from './skeleton';
import { TagBody } from './tag';
import { SliderBody } from './slider';
import { SnackbarBody } from './snackbar';
import { SplitButtonBody } from './split-button';
import { SwitchBody } from './switch';
import { TabsBody } from './tabs';
import { TextFieldBody } from './text-field';
import { TimePickerBody } from './time-picker';
import { ToolbarsBody } from './toolbars';
import { TooltipBody } from './tooltip';
import { TopAppBarBody } from './top-app-bar';
import { COMPONENT_META, type ComponentMeta } from './catalog';
import type { ComponentDoc } from './doc';

// Re-export the pure catalog surface so existing server imports keep resolving via registry.
export type {
  ComponentGroup,
  ComponentMeta,
  ComponentSpecs,
  RailGroup,
  RailGroupId,
} from './catalog';
export {
  CATEGORY_COUNT,
  COMPONENT_META,
  COMPONENT_META_MAP,
  COMPONENT_PAGE_COUNT,
  GALLERY_RAIL_GROUPS,
  RAIL_GROUPS,
  RAIL_GROUP_MAP,
  pagesInRailGroup,
} from './catalog';

/** Builds a component page's written content, split by tab (it reads example sources). */
export type ComponentDocLoader = () => ComponentDoc | Promise<ComponentDoc>;

/** A fully-wired component page: catalog metadata plus its written content. */
export interface ComponentPageMeta extends ComponentMeta {
  /** The page's content per tab: examples, guidelines, accessibility and API notes. */
  loadDoc: ComponentDocLoader;
}

/** The content for each slug, kept separate from the pure catalog so clients can import it. */
const BODIES: Record<string, ComponentDocLoader> = {
  button: ButtonBody,
  'icon-button': IconButtonBody,
  'button-group': ButtonGroupBody,
  'split-button': SplitButtonBody,
  fab: FabBody,
  'fab-menu': FabMenuBody,
  'reaction-picker': ReactionPickerBody,
  'text-field': TextFieldBody,
  'message-field': MessageFieldBody,
  'rich-message-field': RichMessageFieldBody,
  'pin-input': PinInputBody,
  'phone-field': PhoneFieldBody,
  'image-crop': ImageCropBody,
  'media-upload-grid': MediaUploadGridBody,
  select: SelectBody,
  autocomplete: AutocompleteBody,
  checkbox: CheckboxBody,
  'radio-group': RadioGroupBody,
  switch: SwitchBody,
  slider: SliderBody,
  chips: ChipsBody,
  card: CardBody,
  dialog: DialogBody,
  menu: MenuBody,
  tooltip: TooltipBody,
  sheets: SheetsBody,
  list: ListBody,
  carousel: CarouselBody,
  'media-viewer': MediaViewerBody,
  badge: BadgeBody,
  avatar: AvatarBody,
  divider: DividerBody,
  'navigation-rail': NavigationRailBody,
  'navigation-bar': NavigationBarBody,
  tabs: TabsBody,
  'top-app-bar': TopAppBarBody,
  search: SearchBody,
  toolbars: ToolbarsBody,
  snackbar: SnackbarBody,
  progress: ProgressBody,
  'loading-indicator': LoadingIndicatorBody,
  'pull-to-refresh': PullToRefreshBody,
  skeleton: SkeletonBody,
  tag: TagBody,
  link: LinkBody,
  'file-trigger': FileTriggerBody,
  'skip-link': SkipLinkBody,
  'shaped-icon': ShapedIconBody,
  collapse: CollapseBody,
  'comment-row': CommentRowBody,
  'load-more': LoadMoreBody,
  'media-grid': MediaGridBody,
  'reaction-summary': ReactionSummaryBody,
  'expandable-text': ExpandableTextBody,
  alert: AlertBody,
  'empty-state': EmptyStateBody,
  'list-detail-layout': ListDetailLayoutBody,
  'date-picker': DatePickerBody,
  'time-picker': TimePickerBody,
  'picker-dialog': PickerDialogBody,
  primitives: PrimitivesBody,
};

/** Every component page, in display order: catalog metadata wired to its page body. */
export const COMPONENT_PAGES: ComponentPageMeta[] = COMPONENT_META.map((meta) => {
  const loadDoc = BODIES[meta.slug];
  if (!loadDoc) throw new Error(`No page content registered for component slug "${meta.slug}"`);
  return { ...meta, loadDoc };
});

/** The registry keyed by slug, for the dynamic route to resolve a page. */
export const COMPONENT_PAGE_MAP: Record<string, ComponentPageMeta> = Object.fromEntries(
  COMPONENT_PAGES.map((page) => [page.slug, page]),
);
