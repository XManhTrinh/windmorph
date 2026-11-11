import Link from 'next/link';

const PAGES = ['one', 'two'];

export const dynamicParams = false;

export function generateStaticParams() {
  return PAGES.map((page) => ({ page }));
}

/** A long page with links to the other one along it, for `e2e/scroll-pane.spec.ts`. */
export default async function ScrollPanePage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const other = page === 'one' ? 'two' : 'one';
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-headline-small">Page {page}</h1>
      {Array.from({ length: 60 }, (_, index) => (
        <p key={index} className="m-0 text-body-large">
          Page {page}, paragraph {index + 1}.{' '}
          {index % 10 === 5 && (
            <Link href={`/scroll-pane/${other}`} className="text-primary underline">
              To page {other} from paragraph {index + 1}
            </Link>
          )}
        </p>
      ))}
    </div>
  );
}
