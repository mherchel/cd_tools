# cd_core + theming_tools → Drupal 12 Upgrade — Hand-off

## Result

- **cd_core**: fully upgraded. All 7 submodules + 2 test themes enable cleanly on Drupal 12-dev. `incompatible_theme` left at `^7` as it's a deliberate test fixture.
- **theming_tools**: 28 of 29 submodules enabled. Only `toolbartest` skipped (depends on `tour`, which is removed from core).
- **phpstan error count**: 267 → 231 (all 36 removed errors were real D12 deprecations; the remaining 231 are style lints — `missingType.return`, unused constructor params, test-class attribute requirements — which are out of scope per "install + deprecations" goal).

## Changes to `modules/cd_core`

**Metadata (10 files):** dropped `core: 8.x`, bumped `core_version_requirement: ^8 || ^9` → `^10.3 || ^11 || ^12` in:

- `cd_core.info.yml`, `composer.json`
- `modules/tt_node/tt_node.info.yml`
- `modules/devhelp/devhelp.info.yml`
- `modules/lang_hebrew/lang_hebrew.info.yml`
- `modules/pointertracker/pointertracker.info.yml`
- `modules/testfilters/testfilters.info.yml` (plus `drupal:ckeditor` → `drupal:ckeditor5`)
- `modules/textfixtures/textfixtures.info.yml`
- `modules/themeswitcher/themeswitcher.info.yml`
- `themes/noscreenshot_theme/noscreenshot_theme.info.yml` (plus `base theme: stable` → `stable9`)
- `themes/noscreenshot_2_theme/noscreenshot_2_theme.info.yml` (plus `base theme: stable` → `stable9`)

**Code fixes:**

- `modules/devhelp/src/ConfigOverrider.php` — added missing `use Drupal\Core\Config\StorageInterface;`
- `modules/themeswitcher/src/Form/ThemeSwitcherForm.php` — declared typed `$availableThemes` property, initialized `$options`, replaced removed `REQUEST_TIME` constant with `\Drupal::time()->getRequestTime()`, added `implements TrustedCallbackInterface` + static `lazyBuilder()` and `trustedCallbacks()` methods (for the page_bottom bubbling fix — see below)
- `modules/themeswitcher/themeswitcher.module` — `themeswitcher_page_bottom()` now returns a `#lazy_builder` placeholder referencing `ThemeSwitcherForm::lazyBuilder` instead of eagerly calling `\Drupal::formBuilder()->getForm()`. Eager form building inside hook_page_bottom fails Drupal 12's stricter render-context bubbling assertion (`$context->count() <= 1` in `Renderer::executeInRenderContext()`). The lazy builder lets the form build inside the main render context where metadata bubbles correctly.
- `src/Plugin/Condition/ToolbarAccess.php` — `@Condition` annotation: deprecated `context =` key → `context_definitions =`; fixed duplicate `#default_value` array key (the second one was clearly meant to be `#description`)
- `modules/testfilters/config/install/editor.editor.cd_basic_html.yml` — rewrote as a CKEditor 5 editor config matching the `cd_basic_html` filter format's allowed HTML

## Changes to `modules/theming_tools`

**Metadata (30 files):** same pattern — dropped `core: 8.x`, bumped `core_version_requirement: ^8 || ^9 || ^10` → `^10.3 || ^11 || ^12` across `theming_tools.info.yml`, `composer.json`, and all 28 submodule `.info.yml` files. `modules/textarea/textarea.info.yml` additionally switched `drupal:ckeditor` → `drupal:ckeditor5`.

**Code fixes:**

- `modules/card/card.install` — `ThemeHandler::rebuildThemeData()` removed; replaced with `\Drupal::service('extension.list.theme')->reset()->getList()`
- `modules/dialog/src/Controller/DialogController.php` — removed deprecated `_filter_tips(-1, TRUE)` call; added private `buildFilterTips()` helper using `FilterFormatRepositoryInterface`
- `modules/dropbutton/dropbutton.module` — fixed malformed `@var` PHPDoc tag; added `array` type hint on `hook_entity_type_alter` param
- `modules/dropbutton/src/LanguageAccessControlHandler.php` — narrowed inline `@var` type to `ConfigurableLanguageInterface` so `isLocked()` / `isDefault()` resolve
- `modules/dropbutton/src/NodeTypeAccessControlHandler.php` — added `@var NodeTypeInterface` cast for `isLocked()`; narrowed `originalCheckAccess` `@return` from `AccessResultInterface` to concrete `AccessResult` (for `addCacheableDependency()`)
- `modules/imagefile/imagefile.install` — replaced removed `FileSystemInterface::EXISTS_RENAME` constant with `FileExists::Rename` enum
- `modules/sidebar/src/NodeAccessControlHandler.php` — PHP 8.4 explicit nullable on `?AccountInterface` params (2 methods)
- `modules/tabledrag/src/Form/TableDragTestForm.php` — `sortRows()` now returns the sorted `$table_state` array
- `src/Form/DashboardForm.php` — removed `loadInclude('system', 'inc', 'system.admin')` for removed file; replaced removed `system_sort_modules_by_info_name()` with inline callback; replaced 6 usages of undefined `Extension::$status` with `ModuleHandler::moduleExists()`; replaced 4 usages of undefined `Extension::$requires` with a new `getRequiredModuleNames()` helper that parses `$extension->info['dependencies']`; removed dead `empty($reasons) &&` branch
- `modules/tab/src/Controller/TabController.php` — **new file**. Replaces references to the removed `\Drupal\filter\Controller\FilterController::filterTips()` method with a local controller using `FilterFormatRepositoryInterface`
- `modules/tab/tab.routing.yml` — 3 routes re-pointed from `FilterController::filterTips` to the new `TabController::filterTips` / `TabController::overview`
- `modules/title_shortcut/title_shortcut.module` — `title_shortcut_toolbar()` used `Url::fromRoute('filter.tips', ['filter_format' => 'plain_text'])`. The `filter.tips` route was removed from core in D11+; rendering the toolbar for authenticated users threw a missing-route exception that leaked render context and triggered the D12 bubbling assertion on every authenticated page. Replaced with `Url::fromRoute('<front>')` since the toolbar item is a dev-helper quick-link where the specific target doesn't matter.

## Side effects in the Drupal core repo (for git cleanup)

These modifications were made to support the upgrade but are **not** intended to be committed to Drupal core. Same pattern the user already uses for drush:

- `composer.json` / `composer.lock` — added `drush/drush` (re-added after an earlier rector install/uninstall side-effect), `drupal/contact` (^1.0), `drupal/field_layout` (^2.0)
- `modules/contrib/contact/` — new directory from `drupal/contact` contrib
- `modules/contrib/field_layout/` — new directory from `drupal/field_layout` contrib
- `composer/Metapackage/CoreRecommended/composer.json` + `composer/Metapackage/DevDependencies/composer.json` + `composer/Metapackage/PinnedDevDependencies/composer.json` — scaffold regenerations from the composer operations

Recommended cleanup: `git checkout composer.json composer.lock composer/Metapackage/` on the core repo after committing the module changes, and reinstall the contrib deps fresh each session.

## Known follow-ups / left behind

1. **`toolbartest` submodule** — metadata claims D12 compat but can't enable without `drupal/tour` contrib. Its `routing.yml` also has 5 references to the removed `FilterController::filterTips` method that were **not** fixed (since the module can't enable anyway). To enable it later, either: (a) install `drupal/tour` + create a `toolbartest/src/Controller/ToolbarTestController.php` mirroring the `TabController` pattern, or (b) remove the `drupal:tour` dep and the filter-tips routes.

2. **Tests out of scope** — existing `tests/` directories were not touched. They have their own set of D12 issues (`assertEqual()` removed, `#[Group]` attribute required, `trustData()` deprecated, `$modules` visibility, `$defaultTheme` required, `setUp()` return type). If tests passing against D12 is desired, that's a separate pass.

3. **Style lints left** — phpstan-drupal still reports ~225 `missingType.return` warnings and a handful of `constructor.unusedParameter` / test-class-attribute items. These were out of scope per the "install + deprecations" goal but are easy follow-up work.

4. **`#[Hook]` OOP conversion** — procedural hooks in `.module` files were left as-is per scope.

## What to commit where

- **cd_core repo branch**: 10 info.yml files, composer.json, 4 .php files (`ConfigOverrider`, `ThemeSwitcherForm`, `ToolbarAccess`), 1 editor config YAML, 2 theme info.yml files. Zero git operations performed by the assistant — ready to stage and commit.
- **theming_tools repo branch**: 29 info.yml files, composer.json, 8 .php files, 1 .install file, 1 routing.yml, 1 new `TabController.php`. Zero git operations performed by the assistant — ready to stage and commit.
