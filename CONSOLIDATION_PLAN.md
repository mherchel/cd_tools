# cd_core → theming_tools Consolidation Plan

## Goal

Collapse `cd_core` into `theming_tools` so users only download and install one module. Preserve all existing functionality. No net loss of submodules, test pages, fixtures, themes, plugins, or hooks.

## Pre-merge audit (findings)

- `theming_tools → cd_core` references are **entirely at the module-dependency level**: 17 entries across 12 `*.info.yml` files.
- **Zero code-level references** between the two modules: no `Drupal\cd_core\*` PHP imports from theming_tools, no `cd_core/*` library references, no cross-namespace calls.
- **No machine-name collisions**: none of cd_core's 7 submodules share a name with any of theming_tools's 28 submodules.
- cd_core has 3 PHP classes in its root `src/` (`Plugin/Condition/ToolbarAccess`, `ContactFormAccessControlHandler`, `ContactFormPermissions`), plus 3 test themes, 1 layout plugin (side_by_side), and root `.module` hooks (entity_type_alter, template_preprocess_layout__side_by_side, preprocess_container__sbs_item, menu_links_discovered_alter).

Because the coupling is purely metadata-level, the merge is mechanical.

## Target shape after merge

```
modules/theming_tools/
├── theming_tools.info.yml
├── theming_tools.module           ← gets merged cd_core hooks
├── theming_tools.layouts.yml      ← gains the side_by_side layout plugin definition
├── theming_tools.libraries.yml    ← gains the side-by-side library
├── theming_tools.permissions.yml  ← merged with cd_core.permissions.yml
├── theming_tools.links.menu.yml   ← unchanged (Theming tools drawer parent)
├── composer.json
├── src/
│   ├── Form/DashboardForm.php                  (existing)
│   ├── Plugin/Condition/ToolbarAccess.php      ← moved from cd_core
│   ├── ContactFormAccessControlHandler.php     ← moved from cd_core
│   └── ContactFormPermissions.php              ← moved from cd_core
├── layouts/
│   └── side-by-side/                           ← moved from cd_core
├── themes/
│   ├── noscreenshot_theme/                     ← moved from cd_core
│   ├── noscreenshot_2_theme/                   ← moved from cd_core
│   └── incompatible_theme/                     ← moved from cd_core (stays ^7 test fixture)
└── modules/
    ├── (28 existing theming_tools submodules)
    ├── tt_node/         ← moved from cd_core/modules/
    ├── devhelp/         ← moved
    ├── lang_hebrew/     ← moved
    ├── pointertracker/  ← moved
    ├── testfilters/     ← moved
    ├── textfixtures/    ← moved
    └── themeswitcher/   ← moved
```

**Result:** 1 root module + 35 submodules + 3 test themes + 1 layout plugin, all under a single `modules/theming_tools/` directory. The `cd_core` directory is removed.

## Guiding principle

**Move files, preserve machine names.** Drupal's module discovery keys off each `*.info.yml`'s machine name, not the parent directory. `cd_core/modules/tt_node/tt_node.info.yml` and `theming_tools/modules/tt_node/tt_node.info.yml` register the exact same machine name (`tt_node`), so installed config entities (`filter.format.cd_basic_html`, `node.type.cd`, etc.) and their references need no rewriting.

## Decisions (locked)

1. **Flatten cd_core submodules into `theming_tools/modules/`**, not nested under a `core/` subdirectory. No name collisions; preserves each submodule's own PHP namespace (`Drupal\devhelp`, `Drupal\themeswitcher`, etc.).
2. **Move cd_core's 3 root `src/` classes into `theming_tools/src/`** and rewrite namespaces from `Drupal\cd_core` → `Drupal\theming_tools`. These classes are small and directly support theming_tools's dashboard/testing purpose.
3. **Rewrite dep strings:** `cd_core:tt_node` → `theming_tools:tt_node`, `cd_core:lang_hebrew` → `theming_tools:lang_hebrew`, `cd_core:testfilters` → `theming_tools:testfilters`, `cd_core:textfixtures` → `theming_tools:textfixtures`, `cd_core:cd_core` → `theming_tools:theming_tools`.
4. **Test themes stay in `themes/` under theming_tools.** Path-based theme discovery means Drupal finds them regardless of parent path.
5. **Config files** in `cd_core/config/install/*` move alongside their matching module or into `theming_tools/config/install/` (for root config). Any `dependencies.module: cd_core` entries inside shipped config get rewritten to `theming_tools`.
6. **Tests relocate** (files only — tests are out of scope for active maintenance, but the files must not dangle in a deleted directory).

## Phases

### Phase 0 — Pre-flight

- Run `drush si -y` if the current local DB state is unknown or stale. **User decides when.**
- Record current `drush pm:list --status=enabled` output for all `cd_core`/`theming_tools` modules. We'll verify the same set is enabled after the merge.
- User creates a branch on the theming_tools repo for this work. **Assistant performs zero git operations.**
- Uninstall all currently-enabled cd_core modules **before touching files** to clear `system.schema` key_value entries pointing at the old `cd_core` slot. Skipping this reproduces the exact recursive-router-rebuild failure mode we hit during the earlier `tt_navigation` rename.

### Phase 1 — Move cd_core submodules into theming_tools/modules/

Pure directory relocations, no content changes:

| From | To |
|---|---|
| `modules/cd_core/modules/tt_node/` | `modules/theming_tools/modules/tt_node/` |
| `modules/cd_core/modules/devhelp/` | `modules/theming_tools/modules/devhelp/` |
| `modules/cd_core/modules/lang_hebrew/` | `modules/theming_tools/modules/lang_hebrew/` |
| `modules/cd_core/modules/pointertracker/` | `modules/theming_tools/modules/pointertracker/` |
| `modules/cd_core/modules/testfilters/` | `modules/theming_tools/modules/testfilters/` |
| `modules/cd_core/modules/textfixtures/` | `modules/theming_tools/modules/textfixtures/` |
| `modules/cd_core/modules/themeswitcher/` | `modules/theming_tools/modules/themeswitcher/` |

### Phase 2 — Move cd_core root-level assets

| From | To | Content change |
|---|---|---|
| `cd_core/src/Plugin/Condition/ToolbarAccess.php` | `theming_tools/src/Plugin/Condition/ToolbarAccess.php` | Namespace `Drupal\cd_core\Plugin\Condition` → `Drupal\theming_tools\Plugin\Condition` |
| `cd_core/src/ContactFormAccessControlHandler.php` | `theming_tools/src/ContactFormAccessControlHandler.php` | Namespace `Drupal\cd_core` → `Drupal\theming_tools` |
| `cd_core/src/ContactFormPermissions.php` | `theming_tools/src/ContactFormPermissions.php` | Namespace `Drupal\cd_core` → `Drupal\theming_tools` |
| `cd_core/layouts/side-by-side/` | `theming_tools/layouts/side-by-side/` | None |
| `cd_core/themes/noscreenshot_theme/` | `theming_tools/themes/noscreenshot_theme/` | None |
| `cd_core/themes/noscreenshot_2_theme/` | `theming_tools/themes/noscreenshot_2_theme/` | None |
| `cd_core/themes/incompatible_theme/` | `theming_tools/themes/incompatible_theme/` | None (stays pinned to `^7` — deliberate fixture) |
| `cd_core/config/install/*` | `theming_tools/config/install/*` | Any `dependencies.module: cd_core` → `theming_tools` |
| `cd_core/tests/*` | `theming_tools/tests/*` | Relocation only; tests out of scope |

### Phase 3 — Merge root-level YAML and .module

- **`cd_core.layouts.yml` → `theming_tools.layouts.yml`**: merge the `side_by_side` layout definition. Update its `library: cd_core/side-by-side` → `library: theming_tools/side-by-side`. Update `path:` if present to match the new location.
- **`cd_core.libraries.yml` → `theming_tools.libraries.yml`**: append the `side-by-side` library entry. Library path prefix changes from `layouts/side-by-side/*` to the same path under theming_tools (identical relative path, no change needed).
- **`cd_core.permissions.yml` → `theming_tools.permissions.yml`**: merge entries. If theming_tools doesn't have a permissions.yml yet, promote cd_core's.
- **`cd_core.module` → `theming_tools.module`**: merge the four hooks:
  - `cd_core_entity_type_alter()` → `theming_tools_entity_type_alter()`. Rewrite the ContactFormAccessControlHandler class reference from `Drupal\cd_core\ContactFormAccessControlHandler` → `Drupal\theming_tools\ContactFormAccessControlHandler`.
  - `template_preprocess_layout__side_by_side()` — global preprocessor, no rename needed (not module-prefixed).
  - `cd_core_preprocess_container__sbs_item()` → `theming_tools_preprocess_container__sbs_item()`.
  - `cd_core_menu_links_discovered_alter()` → `theming_tools_menu_links_discovered_alter()`. Since this hook now lives in the same module as its `$parent_id` target (`theming_tools.dashboard`), the early-return guard for "theming_tools not enabled" can be simplified.

### Phase 4 — Rewrite dependency references

17 string edits across 12 info.yml files:

| File | Current | New |
|---|---|---|
| `checkboxradio/checkboxradio.info.yml` | `cd_core:cd_core` | `theming_tools:theming_tools` |
| `dropbutton/dropbutton.info.yml` | `cd_core:tt_node`, `cd_core:lang_hebrew` | `theming_tools:tt_node`, `theming_tools:lang_hebrew` |
| `exposed_form/exposed_form.info.yml` | `cd_core:lang_hebrew`, `cd_core:tt_node` | `theming_tools:lang_hebrew`, `theming_tools:tt_node` |
| `fieldcardinality/fieldcardinality.info.yml` | `cd_core:cd_core` | `theming_tools:theming_tools` |
| `fieldset/fieldset.info.yml` | `cd_core:lang_hebrew` | `theming_tools:lang_hebrew` |
| `imagefile/imagefile.info.yml` | `cd_core:cd_core` | `theming_tools:theming_tools` |
| `presuf/presuf.info.yml` | `cd_core:cd_core`, `cd_core:lang_hebrew`, `cd_core:testfilters` | `theming_tools:theming_tools`, `theming_tools:lang_hebrew`, `theming_tools:testfilters` |
| `select/select.info.yml` | `cd_core:cd_core` | `theming_tools:theming_tools` |
| `sidebar/sidebar.info.yml` | `cd_core:tt_node` | `theming_tools:tt_node` |
| `textarea/textarea.info.yml` | `cd_core:cd_core` | `theming_tools:theming_tools` |
| `textform/textform.info.yml` | `cd_core:cd_core`, `cd_core:textfixtures` | `theming_tools:theming_tools`, `theming_tools:textfixtures` |
| `vertical_tabs/vertical_tabs.info.yml` | `cd_core:lang_hebrew` | `theming_tools:lang_hebrew` |

### Phase 5 — Config reference sweep

Grep every file under the new consolidated `theming_tools/` for lingering `cd_core` references:

- `*.info.yml` — should be clean after Phase 4.
- `*.services.yml`, `*.routing.yml`, `*.links.menu.yml`, `*.links.task.yml` — scan for any `cd_core.*` route names or service IDs.
- `config/install/*.yml` — scan for `dependencies.module: cd_core` and rewrite to `theming_tools`. Scan for `dependencies.config:` entries referencing cd_core-provided config (e.g., `filter.format.cd_basic_html`) — these DO NOT need rewriting because the config entity machine names are preserved.
- `.module` / `.install` / `src/**/*.php` — re-verify zero `Drupal\cd_core` or `\cd_core\` references remain.

Expected count: small (< 5) based on the pre-merge audit that showed zero code-level cross-references.

### Phase 6 — Delete cd_core directory

- `rm -rf /Users/mikeherchel/Sites/drupal/modules/cd_core/` — **requires explicit user approval at execution time** since it is destructive.
- Alternative: user can handle the deletion in git themselves (`git rm -r modules/cd_core`). Assistant will not perform this step without explicit go-ahead.

### Phase 7 — Rebuild & verify

1. Truncate Drupal's bootstrap / discovery / container / config caches via SQL to force full module-tree rediscovery:
   ```
   ddev drush sql:query "TRUNCATE cache_bootstrap; TRUNCATE cache_discovery; TRUNCATE cache_container; TRUNCATE cache_config;"
   ```
2. `ddev drush cr`.
3. `ddev drush pm:list --status=enabled` — compare against the Phase 0 baseline. Every module that was enabled before should still be enabled, now sourced from the theming_tools project.
4. Re-enable any cd_core submodules that were uninstalled in Phase 0: `ddev drush en tt_node devhelp lang_hebrew pointertracker testfilters textfixtures themeswitcher`.
5. Smoke test:
   - Homepage (authenticated) — 200
   - `/admin` — 200
   - `/admin/structure/menu/manage/admin` — 200 (confirms the renamed menu_links_discovered_alter hook re-parents cleanly)
   - `/admin/config/user-interface/cd-tools` — dashboard form renders
   - `/button-test`, `/dropbutton`, `/tabledrag`, `/tabs` — representative test routes load
   - Theming tools navigation drawer still shows all enabled submodules
6. Re-run phpstan at level 2 against `modules/theming_tools`. Compare to the pre-merge baseline: should be identical minus the cd_core duplicates (since cd_core src/ files are now under theming_tools).

### Phase 8 — Documentation

- Update `modules/theming_tools/README.md`:
  - Remove references to cd_core as a separate module.
  - Fold cd_core functionality description into theming_tools.
  - Update the submodule table to include the 7 merged submodules.
  - Update dependencies section (no more "install cd_core alongside theming_tools").
- Update any references in `D12_UPGRADE_HANDOFF.md` and `D12_UPGRADE_PLAN.md` for historical continuity.
- Update `CLAUDE.md` at the Drupal root to remove references to cd_core as a separate module and reflect the consolidated structure.

## Risk analysis

- **Renaming ambiguity:** None. Zero code-level cross-references means string rewrites are deterministic.
- **Config dependency dangling:** Addressed in Phase 5 sweep. Any config shipped by cd_core with `dependencies.module: cd_core` becomes orphaned without the rewrite.
- **Bootstrap failure from stale system.schema:** Prevented by the Phase 0 uninstall step. We hit this exact failure during the earlier `tt_navigation` rename and the recovery required direct SQL manipulation of `core.extension`. Do not skip Phase 0.
- **Broken in-place upgrade for existing sites:** Not applicable locally (user does fresh `drush si` after major changes). For anyone downstream consuming these modules from drupal.org, the consolidation is a breaking change requiring a fresh install or a data migration path. Documenting this is a user decision.
- **Rollback:** If anything breaks at Phase 7, user discards the branch. Assistant performs zero git operations at any phase. If filesystem state needs rolling back, `git checkout -- .` on both module repos restores pre-merge state.

## Surface area summary

| Phase | Operations |
|---|---|
| 1 | 7 directory moves |
| 2 | 7 directory moves + 3 namespace rewrites + (N) config moves |
| 3 | 4 YAML merges + 3 hook renames in .module + 1 class reference rewrite |
| 4 | 17 dep string rewrites across 12 info.yml files |
| 5 | ≤ 5 stray references expected |
| 6 | 1 `rm -rf` (destructive, requires approval) |
| 7 | Cache rebuild + smoke tests |
| 8 | README / CLAUDE.md / handoff doc updates |

## Git discipline

**Assistant performs zero git operations at any phase.** User drives all branches, commits, staging, and the final `git rm` of the cd_core directory. Assistant will hand off a grouped change summary at the end of Phase 8 so user can stage and commit in whatever order makes sense for the history.

## Open questions

1. Go/no-go on assistant running `rm -rf modules/cd_core/` at Phase 6 — or does user prefer to handle deletion themselves via `git rm -r`?
2. Timing — start now in the current session, or defer to a future session?
3. Any objections to the three locked decisions (flatten submodules, promote cd_core root classes to theming_tools root, rewrite `cd_core:cd_core` → `theming_tools:theming_tools`)?
