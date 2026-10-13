/** The exports a guide page documents in its API reference, by the page's path. */
export const GUIDE_API: Record<string, { components: string[]; hooks: string[] }> = {
  '/theming': {
    components: ['ThemeProvider', 'ThemeScope', 'ThemeScript'],
    hooks: ['useTheme', 'useThemeScope'],
  },
};
