import { CodeBlock } from '@windmorph/react-pro';
import { highlightSource } from '../../lib/highlight';

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
  useM3Interaction, ButtonBase, Surface, Overlay, TouchTarget,
  // Form field parts
  FieldLabel, SupportingText, ErrorText, CharacterCounter, FieldErrorIcon, SelectionControl,
  // Overlay plumbing
  TriggerContext, useTriggerProps, usePresence, DomDirectionLocale, localeWithDirection,
  // Building your own component
  splitDataAttributes, ThemeScopeContext, generateSchemeColors, materialShapeMask,
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
export async function PrimitivesBody() {
  const [importHtml, interactionHtml, surfaceHtml, tokensHtml, shapeHtml] = await Promise.all([
    highlightSource(importSnippet),
    highlightSource(interactionSnippet),
    highlightSource(surfaceSnippet),
    highlightSource(tokensSnippet),
    highlightSource(shapeSnippet),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">What primitives are</h2>
        <p className="text-body-large text-on-surface-variant">
          Primitives are the internal building blocks the M3 components are assembled from —
          interaction, structure, overlay plumbing and the shape/morph engine. They are also
          published from a separate{' '}
          <code className="text-on-surface">@windmorph/react/primitives</code> entry for building
          custom controls that must match M3 behaviour (ripple, focus ring, state layers, elevation,
          morphing shapes) without re-implementing it.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Reach for primitives only when a finished component does not fit — a bespoke control, a
          new surface, a custom morphing graphic. If an M3 component (
          <code className="text-on-surface">Button</code>,{' '}
          <code className="text-on-surface">TextField</code>,{' '}
          <code className="text-on-surface">Dialog</code>…) covers the need, use it; it already
          wires these primitives together correctly.
        </p>
        <p className="text-body-medium text-on-surface-variant">
          Because the docs site is restricted to the public M3 entries, this page cannot import
          primitives for live demos and has no generated props table. Sections{' '}
          <em>Live examples</em> and <em>Props</em> are therefore not applicable here; the snippets
          below are illustrative strings. The authoritative API lives in the source and TSDoc under{' '}
          <code className="text-on-surface">packages/react/src/primitives.ts</code>.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">The exported surface</h2>
        <p className="text-body-large text-on-surface-variant">
          Everything re-exported from{' '}
          <code className="text-on-surface">@windmorph/react/primitives</code>, grouped by what it
          does:
        </p>
        <CodeBlock
          code={importSnippet}
          html={importHtml}
          lang="tsx"
          title="@windmorph/react/primitives"
        />
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">useM3Interaction</code> — wraps React Aria{' '}
            <code className="text-on-surface">usePress</code> /{' '}
            <code className="text-on-surface">useHover</code> /{' '}
            <code className="text-on-surface">useFocusRing</code> and emits{' '}
            <code className="text-on-surface">data-pressed</code>,{' '}
            <code className="text-on-surface">data-hovered</code>,{' '}
            <code className="text-on-surface">data-focus-visible</code>,{' '}
            <code className="text-on-surface">data-dragged</code>,{' '}
            <code className="text-on-surface">data-disabled</code> and{' '}
            <code className="text-on-surface">data-selected</code>. It owns the Compose ripple
            (fade-in 75ms, grow over 225ms, fade-out 150ms), restarting a fresh ripple on every
            press.
          </li>
          <li>
            <code className="text-on-surface">ButtonBase</code> — unstyled button, link (
            <code className="text-on-surface">href</code>) or toggle (
            <code className="text-on-surface">toggle</code>) behaviour with{' '}
            <code className="text-on-surface">useM3Interaction</code> applied;{' '}
            <code className="text-on-surface">Button</code>,{' '}
            <code className="text-on-surface">IconButton</code> and the FAB only add styling on top.
          </li>
          <li>
            <code className="text-on-surface">Surface</code> (container role + elevation 0–5 +
            shape), <code className="text-on-surface">TouchTarget</code> (48×48px hit area) and{' '}
            <code className="text-on-surface">Overlay</code> (portal to{' '}
            <code className="text-on-surface">body</code> that re-applies the theme attributes and{' '}
            <code className="text-on-surface">dir</code> of where it was rendered).
          </li>
          <li>
            Field parts (<code className="text-on-surface">FieldLabel</code>,{' '}
            <code className="text-on-surface">SupportingText</code>,{' '}
            <code className="text-on-surface">ErrorText</code> with the{' '}
            <code className="text-on-surface">alert</code> role,{' '}
            <code className="text-on-surface">CharacterCounter</code> read as its{' '}
            <code className="text-on-surface">label</code>, and the named{' '}
            <code className="text-on-surface">FieldErrorIcon</code>) and{' '}
            <code className="text-on-surface">SelectionControl</code> (the shared Checkbox / Radio /
            Switch control).
          </li>
          <li>
            <code className="text-on-surface">TriggerContext</code> (an overlay trigger hands its
            press handler and ARIA to a button-like child) and{' '}
            <code className="text-on-surface">useTriggerProps</code> (a trigger of your own merges
            its props into an enclosing trigger&apos;s, so triggers nest),{' '}
            <code className="text-on-surface">usePresence</code> (keeps an overlay mounted until its
            exit transition ends), and <code className="text-on-surface">DomDirectionLocale</code> /{' '}
            <code className="text-on-surface">localeWithDirection</code> (give React Aria the
            keyboard direction of the DOM without changing the app&apos;s language).
          </li>
          <li>
            The morph engine (<code className="text-on-surface">useM3Morph</code>,{' '}
            <code className="text-on-surface">morphPathAt</code>,{' '}
            <code className="text-on-surface">getMorph</code>) and the shape library:{' '}
            <code className="text-on-surface">RoundedPolygon</code>,{' '}
            <code className="text-on-surface">CornerRounding</code>,{' '}
            <code className="text-on-surface">Cubic</code>,{' '}
            <code className="text-on-surface">Morph</code>, the 35{' '}
            <code className="text-on-surface">MaterialShapes</code> (with{' '}
            <code className="text-on-surface">materialShapeNames</code>), the shape builders (
            <code className="text-on-surface">circle</code>,{' '}
            <code className="text-on-surface">pill</code>,{' '}
            <code className="text-on-surface">pillStar</code>,{' '}
            <code className="text-on-surface">rectangle</code>,{' '}
            <code className="text-on-surface">star</code>) and the path serialisers (
            <code className="text-on-surface">polygonToPath</code>,{' '}
            <code className="text-on-surface">morphToPath</code>,{' '}
            <code className="text-on-surface">cubicsToPath</code>).
          </li>
          <li>
            For a component of your own:{' '}
            <code className="text-on-surface">splitDataAttributes</code> (puts{' '}
            <code className="text-on-surface">data-*</code> props on the root when the rest go to a
            React Aria hook), <code className="text-on-surface">ThemeScopeContext</code> (the theme
            of the nearest <code className="text-on-surface">ThemeProvider</code> or{' '}
            <code className="text-on-surface">ThemeScope</code>, to provide one for a subtree),{' '}
            <code className="text-on-surface">generateSchemeColors</code> (every colour role as a
            hex value, for checks such as contrast) and{' '}
            <code className="text-on-surface">materialShapeMask</code> (an M3 shape as a CSS{' '}
            <code className="text-on-surface">mask-image</code>).
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Usage</h2>
        <p className="text-body-large text-on-surface-variant">
          Interaction and structure: <code className="text-on-surface">useM3Interaction</code> gives
          a plain element M3 interaction state, and the token utilities (
          <code className="text-on-surface">state-layer</code>,{' '}
          <code className="text-on-surface">focus-ring</code>) draw it on the background layer with
          no child elements, so consumer layout can never break it (architecture §10).
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
          <code className="text-on-surface">androidx.graphics.shapes</code> and Compose&apos;s{' '}
          <code className="text-on-surface">MaterialShapes</code>. It imports nothing from the rest
          of the library, so primitives and components can both use it.
        </p>
        <CodeBlock code={shapeSnippet} html={shapeHtml} lang="tsx" title="Shapes & morphing" />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Your own component&apos;s tokens</h2>
        <p className="text-body-large text-on-surface-variant">
          A component built on primitives can have tokens like the library&apos;s own.{' '}
          <code className="text-on-surface">defineComponentTokens</code> names them, and the value
          helpers write each default from a system token:{' '}
          <code className="text-on-surface">color</code>,{' '}
          <code className="text-on-surface">colorAt</code>,{' '}
          <code className="text-on-surface">corner</code>,{' '}
          <code className="text-on-surface">px</code>,{' '}
          <code className="text-on-surface">spring</code>,{' '}
          <code className="text-on-surface">typescale</code> and{' '}
          <code className="text-on-surface">typeTokens</code>. They come from the main entry, with{' '}
          <code className="text-on-surface">componentTokensCss</code>, which writes the CSS.
        </p>
        <CodeBlock code={tokensSnippet} html={tokensHtml} lang="ts" title="acme-badge-tokens.ts" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Accessibility notes</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">useM3Interaction</code> is presentation only — it adds
            no roles or names. The control you build is responsible for its own semantics (role,
            accessible name, state), usually by pairing it with the matching React Aria hook.
          </li>
          <li>
            <code className="text-on-surface">focus-ring</code> /{' '}
            <code className="text-on-surface">focus-ring-inset</code> draw a visible focus indicator
            from <code className="text-on-surface">data-focus-visible</code>, so keyboard focus is
            always shown; <code className="text-on-surface">TouchTarget</code> guarantees a 48×48px
            hit area for small controls.
          </li>
          <li>
            <code className="text-on-surface">DomDirectionLocale</code> fixes a subtle bug: React
            Aria reads keyboard direction from its locale, not the DOM{' '}
            <code className="text-on-surface">dir</code>. It supplies the same locale with only its
            script changed, so arrow keys follow the layout while dates and numbers keep the
            app&apos;s language.
          </li>
          <li>
            <code className="text-on-surface">Overlay</code> re-applies the theme and direction of
            where it was rendered and releases focus containment while animating out (via{' '}
            <code className="text-on-surface">usePresence</code>), so overlays opened inside a
            themed or RTL region stay correct.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Layer boundaries &amp; rationale</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The library is four layers with dependencies pointing only downward (enforced by{' '}
            <code className="text-on-surface">eslint-plugin-boundaries</code>): tokens → utils →
            theme / motion → primitives → components → composites. Composites are built only from
            public components, so they may not import primitives directly.
          </li>
          <li>
            <code className="text-on-surface">src/shapes</code> is pure geometry that imports
            nothing, so both primitives and components may use it. Primitives are internal first;
            the <code className="text-on-surface">@windmorph/react/primitives</code> entry exposes
            them for advanced consumers, kept separate from the main M3 entry.
          </li>
          <li>
            These are not M3 components, so they carry no M3 spec guarantees — they are the
            mechanism M3 components are built from. Non-M3 finished components live instead under{' '}
            <code className="text-on-surface">@windmorph/react-pro</code>; primitives are a lower
            layer than that.
          </li>
        </ul>
      </section>
    </>
  );
}
