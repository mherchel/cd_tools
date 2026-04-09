# Theming Tools (theming_tools)

A suite of test modules for Drupal admin theme development. Each submodule
exercises one UI component or form pattern — buttons, dialogs, tables,
form widgets, pagers, tabs, and so on — across multiple themes so
regressions can be spotted visually.

## History and scope

The module was originally named "Clarodist Tools" (with the `cd_` module
prefix): these modules were originally built to support development of the
**Claro** admin theme, and originally shipped as two separate modules
(`cd_core` providing shared fixtures, `cd_tools` providing the test suite).
They have since been consolidated and renamed to `theming_tools`, a
theme-agnostic regression test harness used to develop and test **any**
Drupal admin theme, including the new **Admin** theme (`default_admin`)
shipping with Drupal 12 as Claro's successor.

None of the test pages are theme-specific — each renders in whatever theme
is active, so the suite works equally well against Claro, Admin, Olivero,
Stark, and any contrib/custom admin theme. That's intentional: the whole
point of the module is to surface cross-theme rendering differences.

## What the root module provides

- **`Drupal\theming_tools\Form\DashboardForm`** — a dashboard at
  `/admin/modules/theming-tools` listing every test submodule with
  enable/disable operations and bulk actions.
- **`hook_menu_links_discovered_alter()`** — auto-collects menu links from
  every submodule tagged `theming_test: true` and reparents them under the
  `theming_tools.dashboard` entry in the admin menu. The result is an
  expandable "Theming Tools" drawer in the Drupal Navigation sidebar that lists
  every enabled test page, sorted alphabetically, with zero per-submodule
  maintenance.
- **`hook_entity_type_alter()`** — registers `ContactFormAccessControlHandler`
  on `contact_form` entities so test contact forms ship open to anonymous
  users for test access.
- **Three test themes** — fixtures used to exercise the theme admin UI:
  `noscreenshot_theme` and `noscreenshot_2_theme` (themes without
  screenshots) and `incompatible_theme` (intentionally pinned to
  `core_version_requirement: ^7` as a fixture for the incompatible-theme
  code path — **do not touch this constraint**).

## How auto-discovery works

- Every test submodule is tagged with `theming_test: true` in its info.yml and
  ships a normal `.links.menu.yml` file pointing at its test route.
- `theming_tools_menu_links_discovered_alter()` walks the menu link registry,
  finds every link whose providing module carries the `theming_test` flag,
  and reparents it under the `theming_tools.dashboard` entry in the admin menu
  — sorted alphabetically.
- The Navigation sidebar renders the admin menu, so the "Theming Tools" drawer
  shows up automatically at the bottom with every enabled test page nested
  inside it. Disabling a submodule automatically removes its link.

Adding a new test submodule requires nothing in the root module: set
`theming_test: true` in the submodule's info.yml, ship a `.links.menu.yml`
with its test route, done.

## Submodules

| Submodule          | Purpose                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `actionlink`       | Test page for the Action Link component.                                                      |
| `autocomplete`     | Test pages for the autocomplete form widget.                                                  |
| `button`           | Test pages for `<input>` buttons and button links, including primary/secondary/small variants.|
| `card`             | Opens the appearance admin page to anonymous users for Card component tests.                  |
| `tt_navigation`    | Test pages for the core Navigation block rendering. (Named `tt_navigation` to avoid a machine-name collision with core's `navigation` module.) |
| `tt_node`          | Provides a minimal `cd` content type used by other submodules as a fixture.                   |
| `checkboxradio`    | Test form for checkboxes and radios on a contact form fixture.                                |
| `details`          | Opens the site information form to anonymous users for `<details>` element tests.             |
| `devhelp`          | Disables render caching and enables debug mode via a config override. Dev-only.               |
| `dialog`           | Test page with examples of regular, modal, off-canvas, and off-canvas-top dialogs.            |
| `dropbutton`       | Test pages for the Dropbutton / Operations component, exercising link-based, submit-based, and small-variant dropbuttons side by side. |
| `exposed_form`     | Test pages for Views exposed form and bulk operations form.                                   |
| `fieldcardinality` | Test form for multi-cardinality field widgets on a contact-form fixture.                      |
| `fieldset`         | Test pages for the Fieldset component.                                                        |
| `imagefile`        | Test form for image and managed file form widgets.                                            |
| `lang_hebrew`      | Installs Hebrew as a second UI language and adds a language switcher block, for RTL tests.    |
| `message`          | Test page for the Message component, including `Drupal.Message` JS API variants.              |
| `pager`            | Test pages for pagers (via Views).                                                            |
| `password`         | Provides a test route for the password-confirm widget.                                        |
| `pointertracker`   | Overlays a crosshair on the page that follows the mouse/touch pointer.                        |
| `presuf`           | Test form for form item prefixes and suffixes.                                                |
| `progress`         | Test page for progress indicators (throbber, progress bar, fullscreen).                       |
| `select`           | Test form for single- and multi-value `<select>` widgets.                                     |
| `sidebar`          | Tests the entity meta sidebar by opening node/add routes to anonymous users.                  |
| `tab`              | Provides test routes for local task tabs (at `/tabs`).                                        |
| `table`            | Test pages for the Table component (sortable, selectable, responsive).                        |
| `tabledrag`        | Draggable table tests: taxonomy term overview, mixed-height rows, nested tables, nested hierarchy. |
| `testfilters`      | Demo text formats and a CKEditor 5 editor config (`cd_basic_html`) for filter-tip tests.      |
| `textarea`         | Test form for plain and formatted (CKEditor 5) textarea widgets.                              |
| `textfixtures`     | Defines color, password, and search field types used by form-widget test modules.             |
| `textform`         | Test form for text-like form items (textfield, telephone, email, url, datetime, ...).           |
| `themeswitcher`    | Adds a footer form that auto-switches the active theme on change, via a cookie.               |
| `title_shortcut`   | Tests page titles alongside shortcut badges. Uses the tab submodule's routes as the host page. |
| `vertical_tabs`    | Test pages for the Vertical Tabs component.                                                   |

## Dependencies

### Cross-submodule dependencies

Many form-widget test submodules depend on other theming_tools submodules as
fixtures (e.g., most depend on the root `theming_tools` module for the
`side_by_side` layout plugin and contact-form access handler; some depend
on `theming_tools:tt_node` for the `cd` content type, `theming_tools:lang_hebrew`
for RTL fixtures, or `theming_tools:testfilters` for text format fixtures).
Drupal resolves these automatically when enabling submodules — you don't
need to enable them manually.

- `title_shortcut` depends on `theming_tools:tab` — it reuses the tab submodule's
  `/tabs` route as the page on which to test title+shortcut rendering.

### Contrib modules removed from Drupal 11 core

Drupal 11 moved several modules out of core that theming_tools submodules depend
on. Install from contrib as needed:

```
ddev composer require drupal/contact       # checkboxradio, fieldcardinality, imagefile, presuf, select, textarea, textform
```

If these aren't installed, the dependent submodules simply won't enable.
Every other submodule will work without them.

## Drupal support

`core_version_requirement: ^10.3 || ^11 || ^12`

Tested against the `main` branch of Drupal core (the future Drupal 12). The
declared `^10.3 || ^11` compatibility in info.yml files is best-effort —
active development and regression testing happens against `main` only.
Supported rendering targets include Claro, the new Drupal 12 **Admin**
theme (`default_admin`), Olivero, Stark, and any contrib/custom admin
theme. The test pages render in whatever theme is active on the page —
typically the frontend theme for non-admin routes and the admin theme for
admin routes — which is the entire point: the module is designed to
surface rendering inconsistencies between themes. **Do not force a
specific theme on the test routes** — doing so defeats the
regression-testing purpose.

## Installation

```
ddev drush en theming_tools
# then enable specific test submodules as needed:
ddev drush en button dialog table tabledrag dropbutton textform textarea
```

Or enable the lot at once through the dashboard form at
`/admin/modules/theming-tools` (once `theming_tools` is enabled).

## Dashboard and navigation drawer

- **Dashboard form** — `/admin/modules/theming-tools`, provided by
  `Drupal\theming_tools\Form\DashboardForm`. Lists every test submodule with
  per-row operations to install or uninstall, plus bulk enable/disable.
- **Navigation drawer** — a "Theming Tools" expandable group auto-injected at
  the bottom of the admin menu. Clicking the drawer header navigates to
  the dashboard form; expanding it reveals alphabetically-sorted links to
  every enabled test submodule's test page.

## Not for production

Everything in this module is intended for local development and regression
testing. Several submodules intentionally open admin routes to anonymous
users so tests can reach them without authentication; others ship fixture
content types, fields, contact forms, and test data; `devhelp` disables
render caching site-wide. Do not install on a public site.
