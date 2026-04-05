# Clarodist Tools (cd_tools)

A suite of test modules for Drupal admin theme development. Each submodule
exercises one UI component or form pattern — buttons, dialogs, tables,
form widgets, pagers, tabs, and so on — across multiple themes so
regressions can be spotted visually.

## History and scope

The "Clarodist" name (and the `cd_` module prefix) is historical: these
modules were originally built to support development of the **Claro** admin
theme. They have since generalized into a theme-agnostic regression test
harness used to develop and test **any** Drupal admin theme, including the
new **Admin** theme (`default_admin`) shipping with Drupal 12 as Claro's
successor. Despite the legacy name, none of the test pages are
Claro-specific — each renders in whatever theme is active, so the suite
works equally well against Claro, Admin, Olivero, Stark, and any
contrib/custom admin theme. That's intentional: the whole point of the
module is to surface cross-theme rendering differences.

The root `cd_tools` module provides a dashboard at
`/admin/config/user-interface/cd-tools` listing every test submodule with
enable/disable operations, and (via `cd_core`) contributes a "CD Tools"
drawer to the Drupal Navigation sidebar that auto-collects links to every
enabled test page.

## How discovery works

- Every test submodule is tagged with `claro_test: true` in its info.yml and
  ships a normal `.links.menu.yml` file pointing at its test route.
- `cd_core`'s `hook_menu_links_discovered_alter()` walks the menu link
  registry, finds every link whose providing module carries the
  `claro_test` flag, and reparents it under the `cd_tools.dashboard` entry
  in the admin menu — sorted alphabetically.
- The result: the Navigation sidebar shows an expandable "CD Tools" group
  with every enabled test page inside it, at the bottom of the admin menu.
  Disabling a submodule automatically removes its link from the drawer.

Adding a new test submodule requires nothing in `cd_core` or `cd_tools`: set
`claro_test: true`, ship a `.links.menu.yml`, done.

## Submodules

| Submodule          | Purpose                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `actionlink`       | Test page for the Action Link component.                                                      |
| `autocomplete`     | Test pages for the autocomplete form widget.                                                  |
| `button`           | Test pages for `<input>` buttons and button links, including primary/secondary/small variants.|
| `card`             | Opens the appearance admin page to anonymous users for Card component tests.                  |
| `cd_navigation`    | Test pages for the core Navigation block rendering. (Named `cd_navigation` to avoid a machine-name collision with core's `navigation` module.) |
| `checkboxradio`    | Test form for checkboxes and radios on a contact form fixture.                                |
| `details`          | Opens the site information form to anonymous users for `<details>` element tests.             |
| `dialog`           | Test page with examples of regular, modal, off-canvas, and off-canvas-top dialogs.           |
| `dropbutton`       | Test pages for the Dropbutton / Operations component, exercising link-based, submit-based, and small-variant dropbuttons side by side. |
| `exposed_form`     | Test pages for Views exposed form and bulk operations form.                                   |
| `fieldcardinality` | Test form for multi-cardinality field widgets on a contact-form fixture.                      |
| `fieldset`         | Test pages for the Fieldset component.                                                        |
| `imagefile`        | Test form for image and managed file form widgets.                                            |
| `message`          | Test page for the Message component, including `Drupal.Message` JS API variants.              |
| `pager`            | Test pages for pagers (via Views).                                                            |
| `password`         | Provides a test route for the password-confirm widget.                                        |
| `presuf`           | Test form for form item prefixes and suffixes.                                                |
| `progress`         | Test page for progress indicators (throbber, progress bar, fullscreen).                       |
| `select`           | Test form for single- and multi-value `<select>` widgets.                                     |
| `sidebar`          | Tests the entity meta sidebar by opening node/add routes to anonymous users.                  |
| `tab`              | Provides test routes for local task tabs (at `/tabs`).                                        |
| `table`            | Test pages for the Table component (sortable, selectable, responsive).                        |
| `tabledrag`        | Draggable table tests: taxonomy term overview, mixed-height rows, nested tables, nested hierarchy. |
| `textarea`         | Test form for plain and formatted (CKEditor 5) textarea widgets.                              |
| `textform`         | Test form for text-like form items (textfield, telephone, email, url, datetime, …).          |
| `title_shortcut`   | Tests page titles alongside shortcut badges. Uses the tab submodule's routes as the host page. |
| `toolbartest`      | Opens toolbar and some admin routes to anonymous users. **Requires `drupal/tour` contrib**; not enabled by default. |
| `vertical_tabs`    | Test pages for the Vertical Tabs component.                                                   |

## Dependencies

### Hard dependencies on `cd_core`

The following submodules depend on `cd_core` submodules as fixtures:
`checkboxradio`, `dropbutton`, `exposed_form`, `fieldcardinality`,
`fieldset`, `imagefile`, `presuf`, `select`, `sidebar`, `textarea`,
`textform`, `vertical_tabs`. Install `cd_core` alongside `cd_tools`.

### Removed-from-core modules you may need from contrib

Drupal 11 moved several modules that cd_tools submodules depend on out of
core. Install from contrib as needed:

```
ddev composer require drupal/contact       # checkboxradio, fieldcardinality, imagefile, presuf, select, textarea, textform
ddev composer require drupal/field_layout  # same set as contact
ddev composer require drupal/tour          # toolbartest only
```

If these aren't installed, the dependent submodules simply won't enable.
Everything else in cd_tools will work fine without them.

### Cross-submodule dependencies inside cd_tools

- `title_shortcut` depends on `cd_tools:tab` — it reuses the tab submodule's
  `/tabs` route as the page on which to test title+shortcut rendering.

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
ddev drush en cd_core cd_tools
# then enable specific test submodules as needed:
ddev drush en button dialog table tabledrag dropbutton textform textarea
```

Or enable the lot at once through `/admin/config/user-interface/cd-tools`
(the dashboard form, once `cd_tools` is enabled).

## Dashboard and navigation drawer

- **Dashboard form** — `/admin/config/user-interface/cd-tools`, provided by
  `Drupal\cd_tools\Form\DashboardForm`. Lists every test submodule with
  per-row operations to install or uninstall, plus bulk enable/disable.
- **Navigation drawer** — a "CD Tools" expandable group auto-injected at
  the bottom of the admin menu by `cd_core`. Clicking the drawer header
  navigates to the dashboard form; expanding it reveals links to every
  enabled test submodule's test page.

## Not for production

Everything in this module is intended for local development and regression
testing. Several submodules intentionally open admin routes to anonymous
users so tests can reach them without authentication; others ship fixture
content types, fields, and test data. Do not install on a public site.
