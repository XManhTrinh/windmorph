import * as Primitives from '@windmorph/react/primitives';
import { SPRINGS } from '@windmorph/react';
import { hook, read, type ExportCheck, type ExportChecks } from './check';

const spring = SPRINGS.expressive.spatial.default;
const circle = Primitives.circle();
const star = Primitives.star(5, { innerRadius: 0.5 });

/** `Cookie12Sided` → `cookie12SidedShape`, the name of a precomputed outline's constant. */
type ShapeConstant = `${Uncapitalize<Primitives.MaterialShapeName>}Shape`;

/** Each precomputed outline, read on the server. */
const shapeChecks = Object.fromEntries(
  Primitives.materialShapeNames.map((name) => [
    `${name[0]!.toLowerCase()}${name.slice(1)}Shape`,
    read(Primitives.materialShapePaths[name]),
  ]),
) as Record<ShapeConstant, ExportCheck>;

/** Every value export of `@windmorph/react/primitives`, checked from a server component. */
export const primitivesChecks = {
  ButtonBase: {
    kind: 'component',
    render: () => (
      <Primitives.ButtonBase className="rounded-corner-full bg-primary px-6 py-3 text-on-primary">
        Continue
      </Primitives.ButtonBase>
    ),
  },
  CharacterCounter: {
    kind: 'component',
    render: () => <Primitives.CharacterCounter count={12} max={80} />,
  },
  ErrorText: {
    kind: 'component',
    render: () => <Primitives.ErrorText>Required</Primitives.ErrorText>,
  },
  FieldErrorIcon: { kind: 'component', render: () => <Primitives.FieldErrorIcon label="Error" /> },
  FieldLabel: {
    kind: 'component',
    render: () => <Primitives.FieldLabel>Email</Primitives.FieldLabel>,
  },
  SupportingText: {
    kind: 'component',
    render: () => <Primitives.SupportingText>Shown on your profile.</Primitives.SupportingText>,
  },
  Surface: {
    kind: 'component',
    render: () => (
      <Primitives.Surface
        container="surface-container"
        elevation={1}
        shape="medium"
        className="p-2"
      >
        Surface
      </Primitives.Surface>
    ),
  },
  TouchTarget: {
    kind: 'component',
    render: () => (
      <span className="relative inline-block size-6">
        <Primitives.TouchTarget />
      </span>
    ),
  },
  Overlay: {
    kind: 'component',
    render: () => (
      <Primitives.Overlay>
        <span hidden>Portalled</span>
      </Primitives.Overlay>
    ),
  },
  DomDirectionLocale: { kind: 'client', reason: 'its children is a render function' },
  SelectionControl: { kind: 'client', reason: 'its props come from React Aria hooks' },
  ThemeScopeContext: {
    kind: 'context',
    render: () => (
      <Primitives.ThemeScopeContext
        value={{
          theme: 'ocean',
          mode: 'dark',
          contrast: 'standard',
          motion: 'standard',
          density: 0,
        }}
      >
        <span>Ocean scope</span>
      </Primitives.ThemeScopeContext>
    ),
  },
  TriggerContext: {
    kind: 'context',
    render: () => (
      <Primitives.TriggerContext value={null}>
        <span>No trigger</span>
      </Primitives.TriggerContext>
    ),
  },
  CornerRounding: { kind: 'value', run: () => new Primitives.CornerRounding(0.2, 0.5) },
  Cubic: { kind: 'value', run: () => new Primitives.Cubic() },
  Morph: { kind: 'value', run: () => new Primitives.Morph(circle, star) },
  RoundedPolygon: {
    kind: 'value',
    run: () => new Primitives.RoundedPolygon(circle.features, circle.center),
  },
  MaterialShapes: read(Primitives.MaterialShapes),
  materialShapeNames: read(Primitives.materialShapeNames),
  materialShapePaths: read(Primitives.materialShapePaths),
  ...shapeChecks,
  circle: { kind: 'value', run: () => Primitives.polygonToPath(circle) },
  cubicsToPath: { kind: 'value', run: () => Primitives.cubicsToPath(star.cubics) },
  generateSchemeColors: {
    kind: 'value',
    run: () =>
      Primitives.generateSchemeColors(
        { seed: '#0B57D0', variant: 'tonal-spot' },
        false,
        'standard',
      ),
  },
  getM3Spring: {
    kind: 'value',
    run: () => Primitives.getM3Spring('standard', 'effects', 'slow'),
  },
  getMorph: { kind: 'value', run: () => Primitives.getMorph(circle, star) },
  springProgressWithVelocity: {
    kind: 'value',
    run: () => Primitives.springProgressWithVelocity(spring, 2, 0.1),
  },
  springWithVelocityToLinearEasing: {
    kind: 'value',
    run: () => Primitives.springWithVelocityToLinearEasing(spring, 2),
  },
  localeWithDirection: { kind: 'value', run: () => Primitives.localeWithDirection('en-GB', 'rtl') },
  materialShapeMask: {
    kind: 'value',
    run: () => Primitives.materialShapeMask(Primitives.cookie9SidedShape),
  },
  mergeDataTokens: {
    kind: 'value',
    run: () => Primitives.mergeDataTokens('md-comp-assist-chip', { 'data-tokens': 'app-chip' }),
  },
  morphPathAt: { kind: 'value', run: () => Primitives.morphPathAt(['Circle', 'Square'], 0.5) },
  morphToPath: {
    kind: 'value',
    run: () => Primitives.morphToPath(new Primitives.Morph(circle, star), 0.5),
  },
  pickWidgetAria: {
    kind: 'value',
    run: () => Primitives.pickWidgetAria({ 'aria-expanded': true, title: 'Sample' }),
  },
  pill: { kind: 'value', run: () => Primitives.polygonToPath(Primitives.pill()) },
  pillStar: { kind: 'value', run: () => Primitives.polygonToPath(Primitives.pillStar()) },
  polygonToPath: { kind: 'value', run: () => Primitives.polygonToPath(star, { scale: 48 }) },
  rectangle: { kind: 'value', run: () => Primitives.polygonToPath(Primitives.rectangle()) },
  star: { kind: 'value', run: () => Primitives.polygonToPath(star) },
  selectionControlStyles: { kind: 'value', run: () => Primitives.selectionControlStyles() },
  splitDataAttributes: {
    kind: 'value',
    run: () => Primitives.splitDataAttributes({ 'data-state': 'on', title: 'Sample' }),
  },
  splitRootProps: {
    kind: 'value',
    run: () => Primitives.splitRootProps({ 'aria-busy': true, title: 'Sample', isDisabled: true }),
  },
  surfaceStyles: { kind: 'value', run: () => Primitives.surfaceStyles() },
  useKeepPressedInPlace: hook,
  useM3Interaction: hook,
  useM3Morph: hook,
  useM3Spring: hook,
  usePresence: hook,
  useTriggerProps: hook,
} satisfies ExportChecks<typeof Primitives>;
