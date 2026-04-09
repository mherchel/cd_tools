# Plan: Rename cd_tools → theming_tools

## Context

The `cd_tools` module (originally "Clarodist Tools" by zolhorvath) is being renamed to `theming_tools` ("Theming tools") to better reflect its purpose as a general admin-theme testing suite — not tied to Claro specifically. This module targets multiple Drupal versions (not just D12). Two submodules with `cd_` prefixes are also being renamed: `cd_node` → `tt_node`, `cd_navigation` → `tt_navigation`. All Claro/Clarodist-specific references throughout the codebase are also being made theme-neutral.

## Scope Summary

- **~90+ files** need content changes (expanded from ~60 due to Claro rename)
- **9 files** need renaming (7 root module files + 2 submodule directories)
- **1 root directory** rename: `cd_tools/` → `theming_tools/`
- **2 submodule directories** rename: `cd_node/` → `tt_node/`, `cd_navigation/` → `tt_navigation/`

## Rename mappings

### Machine names and identifiers
| Old | New |
|-----|-----|
| `cd_tools` (module name) | `theming_tools` |
| `cd_node` (submodule) | `tt_node` |
| `cd_navigation` (submodule) | `tt_navigation` |
| `CD Tools` (human-readable) | `Theming tools` |
| `Clarodist Tools` (human-readable) | `Theming Tools` |
| `Clarodist` (layout category) | `Theming Tools` |
| `claro_test: true` (info.yml flag) | `theming_test: true` |
| `$claroTestModules` (PHP property) | `$themingTestModules` |
| `claro_components` (form key) | `theming_components` |
| `/admin/modules/claro-tools` (route path) | `/admin/modules/theming-tools` |
| `claro-autocomplete-country` (CSS ID prefix) | `theming-autocomplete-country` |

### Nightwatch tests
| Old | New |
|-----|-----|
| `"@tags": ["claro"]` | `"@tags": ["theming-tools"]` |
| `installProfile: "clarodist"` | `installProfile: "theming_tools"` |

### User-facing strings (contextual replacements, not blind find-replace)
| Old | New |
|-----|-----|
| `'Claro Tools Dashboard'` | `'Theming Tools Dashboard'` |
| `'Claro Dashboard'` | `'Theming Tools Dashboard'` |
| `'Dashboard of Claro test modules'` | `'Dashboard of theming test modules'` |
| `'Claro Test Modules'` (table caption) | `'Theming Test Modules'` |
| `'Every Claro test module is installed.'` | `'Every theming test module is installed.'` |
| `'Claro test modules are uninstalled.'` | `'Theming test modules are uninstalled.'` |
| `'Claro test node'` (cd_node name) | `'Theming test node'` |
| `'Test node for claro development'` | `'Test node for theme development'` |
| `'Test node type for Claro development'` | `'Test node type for theme development'` |
| `'To uninstall Claro test node...'` | `'To uninstall theming test node...'` |
| `'Claro Checkboxes and Radios'` (contact form label) | `'Theming Checkboxes and Radios'` |
| `'Claro textarea test form'` (contact form label) | `'Theming textarea test form'` |
| `"Claro's pager on Figma"` | `"Pager on Figma"` (or keep as-is if it's a real link) |
| `"Claro theme's development"` (module description) | `"admin theme development"` |

## Step-by-step Plan

### Phase 1: Rename submodule directories and files

1. **Rename `modules/cd_node/`** → `modules/tt_node/`
   - Rename all files: `cd_node.*` → `tt_node.*`
   - Update contents: machine name, function prefixes (`cd_node_` → `tt_node_`), namespace (`Drupal\cd_node` → `Drupal\tt_node`), Claro strings
   - Key files: `tt_node.info.yml`, `tt_node.module`, `src/CdNodeUninstallValidator.php` → `src/TtNodeUninstallValidator.php`, `src/ProxyClass/CdNodeUninstallValidator.php` → `src/ProxyClass/TtNodeUninstallValidator.php`, `config/install/node.type.cd.yml`

2. **Rename `modules/cd_navigation/`** → `modules/tt_navigation/`
   - Rename all files: `cd_navigation.*` → `tt_navigation.*`
   - Update contents similarly, plus Nightwatch test file

### Phase 2: Rename root module files

3. **Rename 7 root files**: `cd_tools.*` → `theming_tools.*`

4. **Update root module file contents**:
   - `theming_tools.info.yml`: name → `'Theming Tools'`, description → theme-neutral, package → `'Theming tools'`
   - `theming_tools.module`: function names `cd_tools_*` → `theming_tools_*`, `claro_test` flag checks → `theming_test`, docblock, string literals
   - `theming_tools.routing.yml`: route `cd_tools.dashboard` → `theming_tools.dashboard`, path → `/admin/modules/theming-tools`, title → `'Theming Tools Dashboard'`, namespace
   - `theming_tools.permissions.yml`: namespace
   - `theming_tools.links.menu.yml`: link ID, route_name, title, description
   - `theming_tools.links.task.yml`: route_name, base_route, title
   - `theming_tools.layouts.yml`: library key, category → `'Theming Tools'`

### Phase 3: Update PHP namespaces and classes

5. **Root PHP files** (4 files in `src/`):
   - `src/ContactFormAccessControlHandler.php` — namespace `Drupal\cd_tools` → `Drupal\theming_tools`
   - `src/ContactFormPermissions.php` — same
   - `src/Form/DashboardForm.php` — namespace, `$claroTestModules` → `$themingTestModules`, `claro_components` → `theming_components`, `claro_test` → `theming_test`, all Claro user-facing strings
   - `src/Plugin/Condition/ToolbarAccess.php` — namespace only

6. **Test PHP files**:
   - `tests/src/Functional/CdToolsLoadTest.php` → rename to `ThemingToolsLoadTest.php`, update class name, namespace, `@group`/`#[Group]`, `$modules`, docblock
   - `tests/src/Functional/ContactFormPermissionTest.php` — namespace

7. **Submodule PHP files**:
   - `modules/toolbartest/src/Routing/RouteSubscriber.php` — route reference
   - `modules/lang_hebrew/lang_hebrew.module` + `.install` — dependency references
   - `modules/devhelp/tests/src/Functional/InstallUninstallTest.php` — module reference
   - `modules/pager/src/Controller/PagerController.php` — Claro pager string
   - `modules/message/src/Controller/MessageController.php` — Claro comment
   - `modules/autocomplete/src/Form/AutocompleteForm.php` — `claro-autocomplete-country` CSS ID prefix

### Phase 4: Update all 35 submodule .info.yml files

8. **Every submodule `.info.yml`**:
   - `package: 'CD Tools'` → `package: 'Theming tools'`
   - `claro_test: true` → `theming_test: true`
   - Any `cd_tools:` dependency prefix → `theming_tools:`
   - Any `cd_node` references → `tt_node`
   - Any `cd_navigation` references → `tt_navigation`

### Phase 5: Update config install YAML files

9. **~7+ config/install/*.yml files** — update module dependencies, labels containing "Claro"
   - `checkboxradio/config/install/contact.form.checkbox_radio.yml` — label
   - `textarea/config/install/contact.form.textarea.yml` — label
   - `cd_node/config/install/node.type.cd.yml` — description
   - All files with `cd_tools`/`cd_node` dependency declarations

### Phase 6: Update Nightwatch tests (~25 files)

10. **Every `tests/Nightwatch/Tests/*.js` file** across submodules:
    - `"@tags": ["claro"]` → `"@tags": ["theming-tools"]`
    - `installProfile: "clarodist"` → `installProfile: "theming_tools"`
    - `modules/autocomplete/tests/`: `claro-autocomplete-country` CSS selectors → `theming-autocomplete-country`

### Phase 7: Update documentation

11. **All 5+ markdown files** — find-and-replace with contextual review:
    - `cd_tools` → `theming_tools`
    - `CD Tools` → `Theming tools`
    - `Clarodist` → `Theming Tools` (where appropriate)
    - `Claro` → theme-neutral language (contextual)
    - `cd_node` → `tt_node`
    - `cd_navigation` → `tt_navigation`
    - `claro_test` → `theming_test`
    - Files: `CLAUDE.md`, `README.md`, `CONSOLIDATION_PLAN.md`, `D12_UPGRADE_PLAN.md`, `D12_UPGRADE_HANDOFF.md`

### Phase 8: Rename root directory (user does this)

12. **Rename directory**: `modules/cd_tools/` → `modules/theming_tools/`
    - Done last since all file edits reference the old path
    - User handles via `git mv` to preserve history

## Key files to modify

| Category | Files | Changes |
|----------|-------|---------|
| Root YAML | 7 files | Rename + content + Claro strings |
| Root PHP | 4 src/ files | Namespace + Claro strings/variables |
| Test PHP | 2-3 test files | Namespace, class name, group |
| Submodule info.yml | 35 files | package + dependencies + claro_test flag |
| Submodule PHP | 5-6 files | References + Claro strings |
| Config YAML | ~7+ files | Module deps + Claro labels |
| Nightwatch JS | ~25 files | Tags + installProfile + CSS selectors |
| Documentation | 5 .md files | All references |
| Submodule dirs | cd_node, cd_navigation | Rename dirs + files + contents |

## Things that do NOT change

- Plugin ID `toolbar_access` (not module-prefixed)
- Test theme directories/names (no cd_tools or Claro references)
- Layout directory name `layouts/side_by_side/` (just the library key changes)
- Other submodule directory names besides cd_node and cd_navigation

## Verification

1. `grep -ri "cd_tools" modules/theming_tools/` — should return 0 results
2. `grep -ri "cd_node" modules/theming_tools/` — should return 0 results
3. `grep -ri "cd_navigation" modules/theming_tools/` — should return 0 results
4. `grep -ri "CD Tools" modules/theming_tools/` — should return 0 results
5. `grep -ri "claro" modules/theming_tools/` — should return 0 results (verify no stray Claro references remain)
6. `grep -ri "clarodist" modules/theming_tools/` — should return 0 results
7. Run PHPStan: `ddev exec vendor/bin/phpstan analyse modules/theming_tools --level=2 --configuration=core/phpstan.neon.dist --no-progress`
8. Enable the module: `ddev drush en theming_tools` and verify the dashboard loads at `/admin/modules/theming-tools`

## Git note

Per project conventions, the user handles all git operations. Claude will make the file changes and provide a summary for staging/committing. The directory renames (`cd_tools/` → `theming_tools/`, `cd_node/` → `tt_node/`, `cd_navigation/` → `tt_navigation/`) are best done via `git mv` to preserve history.
