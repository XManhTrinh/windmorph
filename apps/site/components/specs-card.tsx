import type { ComponentSpecs } from '../content/components/registry';

/**
 * The M3 Expressive specs summary card: sizes / shape / variants / elevation, each derived
 * read-only from `packages/react/src`. Renders only the fields present, so a component without
 * a given dimension simply omits that cell. A Server Component (no interactivity).
 */
export function SpecsCard({ specs }: { specs: ComponentSpecs }) {
  const rows: [string, string][] = [];
  if (specs.sizes && specs.sizes.length > 0) rows.push(['Sizes', specs.sizes.join(', ')]);
  if (specs.shape) rows.push(['Shape', specs.shape]);
  if (specs.variants && specs.variants.length > 0)
    rows.push(['Variants', specs.variants.join(', ')]);
  if (specs.elevation) rows.push(['Elevation', specs.elevation]);
  if (rows.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-headline-small text-on-surface">M3 Expressive specs</h2>
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-corner-large border border-outline-variant bg-outline-variant medium:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 bg-surface p-4">
            <dt className="text-label-medium text-on-surface-variant">{label}</dt>
            <dd className="text-body-medium text-on-surface">
              <code>{value}</code>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
