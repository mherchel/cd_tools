# cd_core + theming_tools → Drupal 12 Upgrade Plan

## Context

- Drupal core is on `main` (future D12), running under DDEV (`type: drupal12`, PHP 8.5).
- `theming_tools` (~28 submodules, root in `modules/theming_tools`) is the "Theming Tools" markup-generator module suite for admin theme development.
- `cd_core` (7 submodules + 3 test themes, root in `modules/cd_core`) is a hard dependency of 12 `theming_tools` submodules.
- Current state of both: `core: 8.x` legacy key + `core_version_requirement: ^8 || ^9` (cd_core) / `^8 || ^9 || ^10` (theming_tools). Neither currently claims D11/D12 compat.

## Scope & Decisions

- **Goal:** Install on D11/D12 **and** fix deprecations. No OOP-hook conversion, no test upgrades.
- **Tooling:** Run everything via DDEV (`ddev exec ...`, `ddev drush ...`).
- **Submodules:** Upgrade all of them equally.
- **Branching / commits:** Assistant performs **zero git operations**. User drives all staging, branching, and committing. Assistant will hand off a grouped change summary at the end.
- **Tests:** Out of scope. Existing `tests/` directories are left untouched.
- **Distribution:** Purely local — no upstream push.

## Known Gotchas

- `cd_core/themes/incompatible_theme/incompatible_theme.info.yml` has `core_version_requirement: ^7` **intentionally** as a test fixture for the "incompatible theme" code path. **Do not touch.**
- 12 `theming_tools` submodules hard-depend on `cd_core:*` — cd_core must be upgraded first.
- Several submodules ship `config/install/*.yml` — watch for config schema failures at enable time: `fieldcardinality`, `imagefile`, `textform`, `textarea`, `select`, `table`, `tabledrag`, `presuf`, `checkboxradio`.
- No annotation-based plugins (`@Block`, `@FieldFormatter`, etc.) found in theming_tools — fewer plugin-discovery deprecations to worry about.

---

## Phase 0 — Setup

1. Verify tooling inside DDEV:
   ```
   ddev exec vendor/bin/drupal-rector --version
   ddev exec vendor/bin/phpstan --version
   ```
2. If missing, install:
   ```
   ddev composer require --dev palantirnet/drupal-rector mglaman/phpstan-drupal
   ```
3. No branch creation by assistant — user will handle git.

## Phase 1 — Metadata sweep

**Order matters: cd_core first, then theming_tools.**

### cd_core
- Root `cd_core.info.yml` + 7 submodule `*.info.yml` + 2 test theme `*.info.yml`:
  - Remove legacy `core: 8.x` line (fatal in D11+).
  - Change `core_version_requirement: ^8 || ^9` → `^10.3 || ^11 || ^12`.
- Leave `themes/incompatible_theme/incompatible_theme.info.yml` untouched.
- Update `cd_core/composer.json` `drupal/core` constraint to match.

### theming_tools
- Root `theming_tools.info.yml` + all 28 submodule `*.info.yml`:
  - Remove legacy `core: 8.x`.
  - Change `core_version_requirement: ^8 || ^9 || ^10` → `^10.3 || ^11 || ^12`.
- Update `theming_tools/composer.json` `drupal/core` constraint.
- Audit `dependencies:` lists for modules renamed/removed in D11/D12 (e.g. toolbar → navigation experience, workspaces → workspaces_ui).

## Phase 2 — Static analysis baseline

Capture output from both tools as the concrete deprecation to-do list:

```
ddev exec vendor/bin/drupal-rector process modules/cd_core modules/theming_tools --dry-run
ddev exec vendor/bin/phpstan analyse modules/cd_core modules/theming_tools --level=2 -c core/phpstan.neon.dist
```

## Phase 3 — Apply fixes

**Order: cd_core first, then theming_tools.**

1. Run rector for real; review diff.
2. Hand-fix anything rector misses. Expected hotspots:
   - `hook_help($route_name, RouteMatchInterface $route_match)` signatures + return types.
   - `.install` hooks: `hook_install($is_syncing)` signature; `hook_requirements` → split into `hook_runtime_requirements` / `hook_update_requirements` (D11).
   - Removed APIs: `\Drupal::service('entity.manager')`, `file_create_url`, `drupal_set_message`, `drupal_render`, `SafeMarkup`, `file_url_transform_relative`.
   - Access control handlers (`NodeAccessControlHandler`, `LanguageAccessControlHandler`, `NodeTypeAccessControlHandler`): verify `checkAccess()` / `AccessResult` usage.
   - `RouteSubscriber` classes (9 of them) — verify against current `RouteSubscriberBase`.
   - Derivatives (`SidebarLocalTaskDeriver`, `DummyMenuLinkDeriver`, `TabLocalTaskDeriver`, `MenuLinkDeriver`) — verify `DeriverBase` + `ContainerDeriverInterface`.
   - Forms (`PasswordForm`, `AutocompleteForm`, `TableTestForm`): `buildForm`/`submitForm` return types, `FormStateInterface`.
3. **Leave procedural hooks in `.module` files as-is** unless a specific hook is deprecated (OOP conversion is out of scope).

## Phase 4 — Enable & smoke test

```
ddev drush en cd_core -y
# then cd_core submodules individually
ddev drush en theming_tools -y
# then theming_tools submodules individually
```

Fix runtime fatals and config-install schema errors as they surface. Dependency order: cd_core submodules must be enabled before the theming_tools submodules that depend on them.

## Phase 5 — Clean deprecation pass

Re-run both tools; output should be clean:

```
ddev exec vendor/bin/drupal-rector process modules/cd_core modules/theming_tools --dry-run
ddev exec vendor/bin/phpstan analyse modules/cd_core modules/theming_tools --level=2 -c core/phpstan.neon.dist
```

## Phase 6 — Hand-off

Assistant produces a grouped change summary:

1. info.yml + composer.json metadata bumps (per module).
2. Rector auto-fixes (per file).
3. Manual deprecation fixes (per concern).
4. Install/schema fixes discovered during Phase 4.

User reviews and handles all git staging/commits/branching.

---

## Out of Scope

- Upgrading or running the existing `tests/` suites.
- Converting procedural hooks to OOP `#[Hook]` attributes.
- Converting annotation plugins to PHP attribute plugins (none found anyway).
- Any upstream contribution / push.
- Any git operation by the assistant.
