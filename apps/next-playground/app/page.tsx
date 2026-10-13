import { COLOR_ROLES, ThemeScope } from '@windmorph/react';
import { CharacterCounter, FieldLabel, SupportingText, Surface } from '@windmorph/react/primitives';
import { InteractiveDemo } from './interactive-demo';
import { ThemeControls } from './theme-controls';

const swatches = COLOR_ROLES.filter(
  (role) => !role.startsWith('on-') && !role.includes('inverse-on'),
);

export default function Page() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-4 medium:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-brand text-display-small-emphasized">@windmorph/react playground</h1>
        <p className="text-body-large text-on-surface-variant">
          Server-rendered with the theme cookie, so reloading never flashes the wrong theme.
        </p>
      </header>

      <ThemeControls />

      <section className="flex flex-col items-start gap-4">
        <h2 className="text-title-large">Interaction</h2>
        <InteractiveDemo />
        <p className="text-body-small text-on-surface-variant">
          Hover, press (ripple) and keyboard focus use background layers and an outline only.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-title-large">Colour roles</h2>
        <ul className="grid grid-cols-2 gap-2 medium:grid-cols-4 expanded:grid-cols-6">
          {swatches.map((role) => (
            <li key={role} className="flex flex-col gap-1">
              <span
                className="h-12 rounded-corner-medium border border-outline-variant"
                style={{ background: `var(--md-sys-color-${role})` }}
              />
              <span className="text-label-small">{role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-title-large">Elevation and shape</h2>
        <div className="flex flex-wrap gap-6">
          {([0, 1, 2, 3, 4, 5] as const).map((level) => (
            <Surface
              key={level}
              container="surface-container-low"
              elevation={level}
              shape="large"
              className="flex size-24 items-center justify-center text-label-large"
            >
              Level {level}
            </Surface>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-title-large">Theme scopes</h2>
        <div className="grid gap-4 medium:grid-cols-3">
          <ThemeScope
            theme="forest"
            mode="dark"
            className="rounded-corner-extra-large bg-surface p-6"
            data-testid="scope-forest"
          >
            <p className="text-title-medium text-primary">forest · dark</p>
            <InteractiveDemo />
          </ThemeScope>
          <ThemeScope
            theme="sunset"
            mode="light"
            contrast="high"
            className="rounded-corner-extra-large bg-surface p-6"
          >
            <p className="text-title-medium text-primary">sunset · light · high contrast</p>
          </ThemeScope>
          <ThemeScope
            theme="slate"
            motion="standard"
            className="rounded-corner-extra-large bg-surface-container p-6"
          >
            <p className="text-title-medium text-primary">slate · standard motion</p>
          </ThemeScope>
        </div>
      </section>

      <section className="flex max-w-sm flex-col gap-1">
        <h2 className="mb-2 text-title-large">Field parts</h2>
        <FieldLabel htmlFor="name" className="text-on-surface-variant">
          Name
        </FieldLabel>
        <input
          id="name"
          aria-describedby="name-help"
          maxLength={20}
          className="rounded-corner-extra-small border border-outline bg-transparent px-4 py-3 text-body-large"
        />
        <div className="flex justify-between px-4">
          <SupportingText id="name-help">Shown on your profile.</SupportingText>
          <CharacterCounter count={0} max={20} />
        </div>
      </section>
    </main>
  );
}
