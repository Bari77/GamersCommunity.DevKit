# @bari77/gc-workspace-editor

Standalone CLI and local SPA to validate and edit a game's **default workspace** JSON layouts.

Games declare widget catalogs under `src/app/features/{scope}/workspace/` and default layouts under `config/{target}/`. The tool runs from the game front directory — nothing is added to the production bundle or routes.

## Folder convention

Each workspace **target** (`player`, `guild`, `team`, …) maps to a feature scope:

| Target | Feature folder (default) | Registry | Default layout |
|--------|--------------------------|----------|----------------|
| `player` | `src/app/features/players/workspace/` | `widget-catalog.ts`, `widget-registry.editor.ts`, `widget-template-host.component.*` | `config/player/workspace.default.json` |
| `guild` | `src/app/features/guilds/workspace/` | same file names | `config/guild/workspace.default.json` |
| `team` | `src/app/features/teams/workspace/` | same file names | `config/team/workspace.default.json` |

Override the feature folder or any path per target in `package.json` when a game names things differently.

## Game contract

In `package.json`:

```json
{
  "gcWorkspace": {
    "defaultTarget": "player",
    "targets": {
      "player": {},
      "guild": {}
    }
  },
  "scripts": {
    "workspace:validate": "gc-workspace validate --all",
    "workspace:validate:player": "gc-workspace validate --target player",
    "workspace:edit": "gc-workspace edit",
    "workspace:edit:guild": "gc-workspace edit --target guild"
  },
  "devDependencies": {
    "@bari77/gc-workspace-editor": "0.8.6"
  }
}
```

An empty target entry `{}` uses the conventional paths above. Override only what differs:

```json
"targets": {
  "player": {},
  "guild": {
    "feature": "guilds",
    "defaultLayout": "config/guild/workspace.default.json"
  }
}
```

Legacy flat `gcWorkspace.catalog` / `defaultLayout` fields still work and are treated as the `player` target.

### `widget-catalog.ts` (plain TS, no Angular)

```typescript
import type { WidgetCatalog } from '@bari77/gc-widgets';

export const gameWorkspaceRegistry = {
  catalog: [ /* WidgetCatalogEntry[] */ ] satisfies WidgetCatalog,
  columns: 12,
  rowHeight: 90,
};
```

### `widget-registry.editor.ts` (editor only)

```typescript
import { gameWorkspaceRegistry } from './widget-catalog';

export const gameWorkspaceEditorRegistry = {
  ...gameWorkspaceRegistry,
  loadTemplateHost: () =>
    import('./widget-template-host.component').then((m) => m.GameWidgetTemplateHostComponent),
};
```

### `widget-template-host.component.ts`

Standalone component declaring every `gcWidget` / `gcWidgetSettings` template. Shared visual contract between the sheet page and the editor.

## Commands

```bash
cd YourGame.Front
npm run workspace:validate
npm run workspace:edit
gc-workspace validate --target guild
gc-workspace edit --target player
```

| Command | Behaviour |
|---------|-----------|
| `validate` | Bundles the catalog module in Node, validates JSON, exit code 1 on errors |
| `validate --all` | Validates every configured target |
| `edit` | Validates one target, starts save API on `:4311`, Vite editor on `:4310`, writes JSON on Save |

`edit` copies the editor app and the raw-TypeScript DevKit widget sources into `.gc-workspace/`
at the root of the game front, because the Angular compiler plugin ignores anything under
`node_modules`. Add `/.gc-workspace` to the game `.gitignore`.

The editor mirrors the game front: it compiles `src/**/*.ts`, honours the `paths` and `baseUrl`
of `tsconfig.json`, and loads the global stylesheets declared on the Angular build target of
`angular.json`. Widgets therefore render exactly as they do in the game.

## Non-goals

- No dev route in the game front router
- No retroactive change to saved entity `LayoutJson` in the database
- Roles, bans and mutes stay on Platform — not in the layout tool
