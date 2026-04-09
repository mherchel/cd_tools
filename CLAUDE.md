# Theming Tools — Claude Code Instructions

This is the Theming Tools (`theming_tools`) module — a regression-testing suite
for Drupal admin themes. See `README.md` for the full submodule list,
dependencies, and installation instructions.

## Architecture at a glance

- **1 root module** (`theming_tools`) providing the dashboard form, auto-collect
  menu drawer, layout plugin, condition plugin, and contact-form access handler.
- **35 submodules** under `modules/`, each exercising one UI component.
- **3 test themes** under `themes/` (fixture themes for the Appearance admin page).
- **1 layout plugin** (`side_by_side`) under `layouts/`.

All test submodules are tagged `theming_test: true` in their `.info.yml`.
This flag drives both the dashboard form listing and the Navigation sidebar
drawer auto-collection.

## Conventions

### Adding a new test submodule

1. Create `modules/<name>/` with a standard `.info.yml`.
2. Set `theming_test: true` and `package: 'Theming tools'` in the info.yml.
3. Ship a `.links.menu.yml` with a menu link pointing at the submodule's
   primary test route — the auto-collect hook in `theming_tools.module`
   (`theming_tools_menu_links_discovered_alter`) will reparent it under the
   "Theming Tools" drawer in the admin menu automatically.
4. If the submodule needs the side-by-side layout, the contact-form access
   handler, or other root-level features, declare `theming_tools:theming_tools` as
   a dependency.

No changes to the root module are needed. The new submodule shows up in the
dashboard form and navigation drawer automatically.

### Module dependency format

Cross-submodule dependencies use the `theming_tools:<submodule>` format:
```yaml
dependencies:
  - theming_tools:theming_tools       # root module (layout, contact access handler)
  - theming_tools:lang_hebrew    # RTL fixtures
  - theming_tools:tt_node        # test content type
  - theming_tools:testfilters    # text format fixtures
  - theming_tools:textfixtures   # custom field types
  - theming_tools:tab            # tab test routes (used by title_shortcut)
```

### Package name

All modules in this suite use `package: 'Theming tools'`. This groups them
together on the Extend admin page (`/admin/modules`).

## Do not touch

- **`themes/incompatible_theme/incompatible_theme.info.yml`** — intentionally
  pinned to `core_version_requirement: ^7`. This is a test fixture for the
  "incompatible theme" rendering path. Do not bump this constraint.
- **`tt_node` has `theming_test: false`** — deliberately excluded from the
  dashboard/drawer. It's infrastructure (a content type fixture), not a
  test page.

## Removed-from-core dependencies

Drupal 11+ moved these modules out of core. They must be installed from
contrib for the submodules that need them:

| Contrib module | Install command | Used by |
|---|---|---|
| `drupal/contact` | `ddev composer require drupal/contact` | checkboxradio, fieldcardinality, imagefile, presuf, select, textarea, textform |
| `drupal/field_layout` | `ddev composer require drupal/field_layout` | same as contact |
| `drupal/tour` | `ddev composer require drupal/tour` | toolbartest only |

These are local-only composer deps — they modify `composer.json` /
`composer.lock` in the Drupal core repo but are not committed. Revert with
`git checkout composer.json composer.lock composer/Metapackage/` after each
session.

## Key D12 migration notes

These patterns were fixed during the D8/9/10 → D12 upgrade and should not
be reintroduced:

- **No `core: 8.x`** in any `.info.yml` (fatal in D11+).
- **No `drupal:ckeditor`** dependency — use `drupal:ckeditor5`.
- **No `base theme: stable`** in test themes — use `stable9` (or
  `starterkit_theme`).
- **No `jquery.once`** or `$.cookie()` in JS — use the `once()` function
  from `core/once` and vanilla `document.cookie`.
- **No `_filter_tips()`** or `FilterController::filterTips()` — both
  removed in D12. Use `FilterFormatRepositoryInterface` to build tips.
- **No `Extension::$status` / `$requires`** — use
  `ModuleHandler::moduleExists()` and `$extension->info['dependencies']`.
- **No `ThemeHandler::rebuildThemeData()`** — use
  `\Drupal::service('extension.list.theme')->reset()->getList()`.
- **No `FileSystemInterface::EXISTS_RENAME`** — use the `FileExists::Rename`
  enum.
- **No `REQUEST_TIME`** constant — use
  `\Drupal::time()->getRequestTime()`.
- **No `RenderElement::processGroup`** / `::preRenderGroup` — the class was
  renamed to `RenderElementBase` in D11+.
- **No `_form:` route key for entity forms** — use `_entity_form:` so
  `HtmlEntityFormController` properly calls `setEntity()`.
- **No eager `formBuilder->getForm()` in `hook_page_bottom()`** — use
  `#lazy_builder` with `TrustedCallbackInterface` to avoid the D12
  bubbling assertion in `Renderer::executeInRenderContext()`.

## Module naming

- The `tt_navigation` submodule is named that way (not `navigation`) to
  avoid a machine-name collision with Drupal core's `navigation` module.
  If adding new submodules, check that the machine name doesn't collide
  with any core module.

## Testing

- **PHPStan** is the primary static analysis tool:
  ```
  ddev exec vendor/bin/phpstan analyse modules/theming_tools --level=2 --configuration=core/phpstan.neon.dist --no-progress
  ```
  The core phpstan config emits many `missingType.return` lints on
  procedural hooks — these are style warnings, not D12 deprecations.
- **Functional tests** exist in `tests/` and some submodules' `tests/`
  directories but are not actively maintained against D12. They have known
  issues (`assertEqual()` removed, `#[Group]` attribute required,
  `$modules` visibility, `$defaultTheme` required).
- **drupal-rector conflicts with drush** in this project. Do not attempt to
  install `palantirnet/drupal-rector` alongside `drush/drush` — it removes
  drush due to a dependency conflict. Use phpstan-driven manual fixes.

## Consolidation history

This module was originally two separate repos (`cd_core` + `cd_tools`) by
zolhorvath. They were consolidated into a single `theming_tools` module during
a D12 upgrade session. See `CONSOLIDATION_PLAN.md` and
`D12_UPGRADE_HANDOFF.md` for the full migration history.
