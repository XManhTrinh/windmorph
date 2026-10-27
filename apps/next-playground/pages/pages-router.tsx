import { useTheme } from '@windmorph/react';
import { Surface } from '@windmorph/react/primitives';

export default function PagesRouterPage() {
  const { theme, mode, setMode } = useTheme();
  return (
    <main className="flex flex-col gap-4 p-8">
      <h1 className="text-headline-medium">Pages Router</h1>
      <Surface container="surface-container" shape="large" elevation={1} className="p-6">
        <p className="text-body-large" data-testid="pages-theme">
          {theme} · {mode}
        </p>
        <button
          type="button"
          className="mt-4 rounded-corner-full bg-primary px-6 py-2 text-label-large text-on-primary"
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        >
          Toggle dark mode
        </button>
      </Surface>
    </main>
  );
}
