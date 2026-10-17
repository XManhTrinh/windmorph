import * as NextEntry from '@windmorph/react/next';
import { hook, type ExportChecks } from './check';

/** Every value export of `@windmorph/react/next`, checked from a server component. */
export const nextChecks = {
  NextRouterProvider: {
    kind: 'component',
    render: () => (
      <NextEntry.NextRouterProvider>
        <span>Nested router provider</span>
      </NextEntry.NextRouterProvider>
    ),
  },
  getThemeFromCookies: {
    kind: 'value',
    run: () => NextEntry.getThemeFromCookies('windmorph-theme=theme%3Drose%26mode%3Ddark'),
  },
  themeAttributes: {
    kind: 'value',
    run: () => NextEntry.themeAttributes(NextEntry.getThemeFromCookies(null)),
  },
  useGuardedNavigate: hook,
  useNavigationGuard: hook,
} satisfies ExportChecks<typeof NextEntry>;
