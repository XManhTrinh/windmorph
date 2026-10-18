/**
 * Renders an inline pre-paint `<script>` the Next 16 App Router way (see Next's
 * "Preventing a flash before hydration" guide): `type="text/javascript"` on the server so
 * the browser executes it synchronously during HTML parsing — before first paint — and
 * `type="text/plain"` on the client so React 19 doesn't warn about a script tag in the
 * component tree and doesn't try to re-run it. The parent must carry `suppressHydrationWarning`
 * (here the script itself does) so the server/client `type` mismatch is accepted.
 *
 * Used for the theme + direction init so the stored theme/mode/contrast/direction are applied
 * before paint with no FOUC, while keeping the dev console/overlay clean.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
