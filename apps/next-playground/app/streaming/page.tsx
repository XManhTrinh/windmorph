import { connection } from 'next/server';
import { ResolvedMode } from './resolved-mode';

/**
 * A page streamed behind `loading.tsx`, so it hydrates as a Suspense boundary after the root
 * layout's `ThemeProvider`. The e2e suite checks it never shows twice as the provider resolves
 * `mode="system"` to the device's mode after hydration.
 */
export default async function StreamingPage({
  searchParams,
}: {
  searchParams: Promise<{ delay?: string }>;
}) {
  await connection();
  const { delay } = await searchParams;
  await new Promise((resolve) => setTimeout(resolve, Number(delay ?? 250)));
  return (
    <main data-testid="streamed-content" className="flex flex-col gap-4 p-4">
      <h1 className="text-headline-medium">Streamed page</h1>
      <ResolvedMode />
    </main>
  );
}
