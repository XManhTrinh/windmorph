import type { ComponentDoc } from './doc';
import { CodeBlock } from '@windmorph/react-pro';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/*
 * This is a conceptual reference, not a live demo page. `@windmorph/react/primitives` is not in
 * the apps/site ESLint allowlist (only `@windmorph/react`, `/next` and `@windmorph/react-pro` are), so this page
 * must NOT import primitives — the usage below is shown with string snippets fed to
 * `CodeBlock`, and there are no `apps/site/examples/primitives/*` files. `generate-props`
 * does not scan primitives either, so the page is registered with `propsComponents: []`
 * and the template renders no props table. Sections (b) live examples and (c) props are
 * therefore N/A, which the page states.
 */

const importSnippet = `import {
  // Interaction & structure
  useM3Interaction, ButtonBase, Surface, surfaceStyles, Overlay, TouchTarget,
  // Form field parts
  FieldLabel, SupportingText, ErrorText, CharacterCounter, FieldErrorIcon,
  SelectionControl, selectionControlStyles,
  // Motion
  useM3Spring, getM3Spring,
  // Overlay plumbing
  TriggerContext, useTriggerProps, usePresence, DomDirectionLocale, localeWithDirection,
  // Building your own component
  splitDataAttributes, mergeDataTokens, ThemeScopeContext, generateSchemeColors,
  materialShapeMask,
  // Morph & shapes
  useM3Morph, morphPathAt, getMorph,
  RoundedPolygon, CornerRounding, Cubic, Morph,
  MaterialShapes, materialShapeNames,
  circle, pill, pillStar, rectangle, star,
  polygonToPath, morphToPath, cubicsToPath,
} from '@windmorph/react/primitives';`;

const interactionSnippet = `function MyControl() {
  const ref = useRef<HTMLButtonElement>(null);
  // Emits data-pressed / data-hovered / data-focus-visible / data-disabled and
  // owns the Compose ripple. Style those data-attributes with the token utilities.
  const { interactionProps, dataAttributes } = useM3Interaction({}, ref);
  return (
    <button ref={ref} {...interactionProps} {...dataAttributes}
      className="state-layer focus-ring rounded-corner-full ...">
      ...
    </button>
  );
}`;

const surfaceSnippet = `// Surface owns elevation + shape + container colour role (there is no Elevation
// component). ButtonBase owns button/link/toggle behaviour with useM3Interaction applied.
<Surface container="surface-container" elevation={1} className="rounded-corner-large p-4">
  <ButtonBase onPress={save}>Save</ButtonBase>
</Surface>`;

const tokensSnippet = `import { color, componentTokensCss, corner, defineComponentTokens, px } from '@windmorph/react';

// A component of your own gets its own tokens (--acme-badge-*). Their defaults read the
// M3 system tokens, so it follows every theme, mode and contrast level.
export const acmeBadgeTokens = defineComponentTokens({
  name: 'acme-badge',
  tokens: {
    container: { value: color('tertiary-container'), description: 'The fill.' },
    corner: { value: corner('small'), description: 'The corner radius.' },
    height: { value: px(24), description: 'The height.' },
  },
});

// At build time, write the variables into your stylesheet.
const css = componentTokensCss(acmeBadgeTokens);`;

const shapeSnippet = `// Pure geometry (src/shapes): no React, no tokens. useM3Morph returns a Motion value
// of SVG path data; morphPathAt is the same as a plain function at a fixed progress.
const d = morphPathAt(['Circle', 'Flower'], 0.5, { size: 48 });

// Render morphs with overflow visible: mid-morph control points can sit ~1% outside the box.
<svg viewBox="0 0 48 48" overflow="visible"><path d={d} /></svg>`;

/** Primitives reference page body (prose + string CodeBlocks; no live primitives import). */
export async function PrimitivesBody(): Promise<ComponentDoc> {
  const [importHtml, interactionHtml, surfaceHtml, tokensHtml, shapeHtml] = await Promise.all([
    highlightSource(importSnippet),
    highlightSource(interactionSnippet),
    highlightSource(surfaceSnippet),
    highlightSource(tokensSnippet),
    highlightSource(shapeSnippet),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="what-primitives-are" className="text-headline-small text-on-surface">
            What primitives are
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Primitives are the internal building blocks the M3 components are assembled from —
            interaction, structure, overlay plumbing and the shape/morph engine. They are also
            published from a separate <InlineCode>@windmorph/react/primitives</InlineCode> entry for
            building custom controls that must match M3 behaviour (ripple, focus ring, state layers,
            elevation, morphing shapes) without re-implementing it.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Reach for primitives only when a finished component does not fit — a bespoke control, a
            new surface, a custom morphing graphic. If an M3 component (
            <InlineCode>Button</InlineCode>, <InlineCode>TextField</InlineCode>,{' '}
            <InlineCode>Dialog</InlineCode>…) covers the need, use it; it already wires these
            primitives together correctly.
          </p>
          <p className="text-body-medium text-on-surface-variant">
            Because the docs site is restricted to the public M3 entries, this page cannot import
            primitives for live demos and has no generated props table. Sections{' '}
            <em>Live examples</em> and <em>Props</em> are therefore not applicable here; the
            snippets below are illustrative strings. The authoritative API lives in the source and
            TSDoc under <InlineCode>packages/react/src/primitives.ts</InlineCode>.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="layer-boundaries-and-rationale" className="text-headline-small text-on-surface">
            Layer boundaries &amp; rationale
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The library is built in layers, with dependencies pointing only downward (enforced by{' '}
              <InlineCode>eslint-plugin-boundaries</InlineCode>): tokens → utils → theme / motion →
              primitives → components → composites. Composites are built only from public
              components, so they may not import primitives directly.
            </li>
            <li>
              <InlineCode>src/shapes</InlineCode> is pure geometry that imports nothing, so both
              primitives and components may use it. Primitives are internal first; the{' '}
              <InlineCode>@windmorph/react/primitives</InlineCode> entry exposes them for advanced
              consumers, kept separate from the main M3 entry.
            </li>
            <li>
              These are not M3 components, so they carry no M3 spec guarantees — they are the
              mechanism M3 components are built from. Non-M3 finished components live instead under{' '}
              <InlineCode>@windmorph/react-pro</InlineCode>; primitives are a lower layer than that.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="the-exported-surface" className="text-headline-small text-on-surface">
            The exported surface
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Everything re-exported from <InlineCode>@windmorph/react/primitives</InlineCode>,
            grouped by what it does:
          </p>
          <CodeBlock
            code={importSnippet}
            html={importHtml}
            lang="tsx"
            title="@windmorph/react/primitives"
          />
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>useM3Interaction</InlineCode> — wraps React Aria{' '}
              <InlineCode>usePress</InlineCode> / <InlineCode>useHover</InlineCode> /{' '}
              <InlineCode>useFocusRing</InlineCode> and emits <InlineCode>data-pressed</InlineCode>,{' '}
              <InlineCode>data-hovered</InlineCode>, <InlineCode>data-focus-visible</InlineCode>,{' '}
              <InlineCode>data-dragged</InlineCode>, <InlineCode>data-disabled</InlineCode> and{' '}
              <InlineCode>data-selected</InlineCode>. It owns the Compose ripple (fade-in 75ms, grow
              over 225ms, fade-out 150ms), restarting a fresh ripple on every press.
            </li>
            <li>
              <InlineCode>ButtonBase</InlineCode> — unstyled button, link (
              <InlineCode>href</InlineCode>) or toggle (<InlineCode>toggle</InlineCode>) behaviour
              with <InlineCode>useM3Interaction</InlineCode> applied;{' '}
              <InlineCode>Button</InlineCode>, <InlineCode>IconButton</InlineCode> and the FAB only
              add styling on top.
            </li>
            <li>
              <InlineCode>Surface</InlineCode> (container role + elevation 0–5 + shape, with its
              variants as <InlineCode>surfaceStyles</InlineCode>),{' '}
              <InlineCode>TouchTarget</InlineCode> (48×48px hit area) and{' '}
              <InlineCode>Overlay</InlineCode> (portal to <InlineCode>body</InlineCode> that
              re-applies the theme attributes and <InlineCode>dir</InlineCode> of where it was
              rendered).
            </li>
            <li>
              Field parts (<InlineCode>FieldLabel</InlineCode>,{' '}
              <InlineCode>SupportingText</InlineCode>, <InlineCode>ErrorText</InlineCode> with the{' '}
              <InlineCode>alert</InlineCode> role, <InlineCode>CharacterCounter</InlineCode> read as
              its <InlineCode>label</InlineCode>, and the named{' '}
              <InlineCode>FieldErrorIcon</InlineCode>) and <InlineCode>SelectionControl</InlineCode>{' '}
              (the shared Checkbox / Radio / Switch control, with its variants as{' '}
              <InlineCode>selectionControlStyles</InlineCode>).
            </li>
            <li>
              <InlineCode>useM3Spring</InlineCode> and <InlineCode>getM3Spring</InlineCode> (an M3
              spring, such as spatial fast, as Motion transition options:{' '}
              <InlineCode>useM3Spring</InlineCode> from the active motion scheme,{' '}
              <InlineCode>getM3Spring</InlineCode> from a scheme you name; both are also in the main
              entry).
            </li>
            <li>
              <InlineCode>TriggerContext</InlineCode> (an overlay trigger hands its press handler
              and ARIA to a button-like child) and <InlineCode>useTriggerProps</InlineCode> (a
              trigger of your own merges its props into an enclosing trigger&apos;s, so triggers
              nest), <InlineCode>usePresence</InlineCode> (keeps an overlay mounted until its exit
              transition ends), and <InlineCode>DomDirectionLocale</InlineCode> /{' '}
              <InlineCode>localeWithDirection</InlineCode> (give React Aria the keyboard direction
              of the DOM without changing the app&apos;s language).
            </li>
            <li>
              The morph engine (<InlineCode>useM3Morph</InlineCode>,{' '}
              <InlineCode>morphPathAt</InlineCode>, <InlineCode>getMorph</InlineCode>) and the shape
              library: <InlineCode>RoundedPolygon</InlineCode>,{' '}
              <InlineCode>CornerRounding</InlineCode>, <InlineCode>Cubic</InlineCode>,{' '}
              <InlineCode>Morph</InlineCode>, the 35 <InlineCode>MaterialShapes</InlineCode> (with{' '}
              <InlineCode>materialShapeNames</InlineCode>), the shape builders (
              <InlineCode>circle</InlineCode>, <InlineCode>pill</InlineCode>,{' '}
              <InlineCode>pillStar</InlineCode>, <InlineCode>rectangle</InlineCode>,{' '}
              <InlineCode>star</InlineCode>) and the path serialisers (
              <InlineCode>polygonToPath</InlineCode>, <InlineCode>morphToPath</InlineCode>,{' '}
              <InlineCode>cubicsToPath</InlineCode>).
            </li>
            <li>
              For a component of your own: <InlineCode>splitDataAttributes</InlineCode> (puts{' '}
              <InlineCode>data-*</InlineCode> props on the root when the rest go to a React Aria
              hook), <InlineCode>mergeDataTokens</InlineCode> (adds your own token set after a
              component's, as the core components do with a <InlineCode>data-tokens</InlineCode>{' '}
              they are given), <InlineCode>ThemeScopeContext</InlineCode> (the theme of the nearest{' '}
              <InlineCode>ThemeProvider</InlineCode> or <InlineCode>ThemeScope</InlineCode>, to
              provide one for a subtree), <InlineCode>generateSchemeColors</InlineCode> (every
              colour role as a hex value, for checks such as contrast) and{' '}
              <InlineCode>materialShapeMask</InlineCode> (an M3 shape as a CSS{' '}
              <InlineCode>mask-image</InlineCode>).
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-6">
          <h2 id="usage" className="text-headline-small text-on-surface">
            Usage
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Interaction and structure: <InlineCode>useM3Interaction</InlineCode> gives a plain
            element M3 interaction state, and the token utilities (
            <InlineCode>state-layer</InlineCode>, <InlineCode>focus-ring</InlineCode>) draw it on
            the background layer with no child elements, so consumer layout can never break it
            (architecture §10).
          </p>
          <CodeBlock
            code={interactionSnippet}
            html={interactionHtml}
            lang="tsx"
            title="useM3Interaction"
          />
          <CodeBlock
            code={surfaceSnippet}
            html={surfaceHtml}
            lang="tsx"
            title="Surface + ButtonBase"
          />
          <p className="text-body-large text-on-surface-variant">
            Morphing shapes: the shape library is pure geometry ported from{' '}
            <InlineCode>androidx.graphics.shapes</InlineCode> and Compose&apos;s{' '}
            <InlineCode>MaterialShapes</InlineCode>. It imports nothing from the rest of the
            library, so primitives and components can both use it.
          </p>
          <CodeBlock code={shapeSnippet} html={shapeHtml} lang="tsx" title="Shapes & morphing" />
        </section>

        <section className="flex flex-col gap-6">
          <h2 id="your-own-components-tokens" className="text-headline-small text-on-surface">
            Your own component&apos;s tokens
          </h2>
          <p className="text-body-large text-on-surface-variant">
            A component built on primitives can have tokens like the library&apos;s own.{' '}
            <InlineCode>defineComponentTokens</InlineCode> names them, and the value helpers write
            each default from a system token: <InlineCode>color</InlineCode>,{' '}
            <InlineCode>colorAt</InlineCode>, <InlineCode>corner</InlineCode>,{' '}
            <InlineCode>px</InlineCode>, <InlineCode>spring</InlineCode>,{' '}
            <InlineCode>typescale</InlineCode> and <InlineCode>typeTokens</InlineCode>. They come
            from the main entry, with <InlineCode>componentTokensCss</InlineCode>, which writes the
            CSS.
          </p>
          <CodeBlock
            code={tokensSnippet}
            html={tokensHtml}
            lang="ts"
            title="acme-badge-tokens.ts"
          />
        </section>
      </>
    ),
  };
}
