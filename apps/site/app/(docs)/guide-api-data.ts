/**
 * The exports a guide page documents in its API reference, by the page's path. `anchor` is the
 * section a link to one of them opens, when it isn't the reference itself.
 */
export const GUIDE_API: Record<string, { components: string[]; hooks: string[]; anchor?: string }> =
  {
    '/api-conventions': { components: ['LabelsProvider'], hooks: [], anchor: 'words' },
    '/theming': {
      components: ['ThemeProvider', 'ThemeScope', 'ThemeScript'],
      hooks: ['useTheme', 'useThemeScope'],
    },
  };
