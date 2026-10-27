# @windmorph/test-utils

Test helpers shared by Windmorph's packages. Private: used only inside this workspace.

| Entry                                    | What it holds                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `@windmorph/test-utils/axe`              | `axeViolations(container)`: runs axe on a rendered container (colour contrast is left to the visual tests)                |
| `@windmorph/test-utils/tailwind-classes` | Checks that every class a style recipe returns is written literally in its source and compiles with the given stylesheets |
| `@windmorph/test-utils/setup`            | The Vitest setup: jest-dom matchers, cleanup between tests, and a `matchMedia` stub driven by `setMediaQueries`           |

Each package keeps a thin `test/` folder that re-exports these, pointing the class check at its
own stylesheets.
