# Agent guidelines — DevKit

Technical rules for AI agents working in GamersCommunity.DevKit (shared front packages, CLI, widgets, UI).

## Never start servers

Do **not** start long-lived demos/servers for the developer. Prefer documenting how they run packages; one-shot builds/tests are OK.

## Shared UI packages

- Components intended for multiple fronts (**Platform**, game remotes) belong here (`gc-ui`, `gc-widgets`, etc.), not duplicated in each Front.
- Keep visuals aligned with **Nebular** / existing GamersCommunity design language.
- Consumers must install **published** package versions. Do not instruct fronts to depend on a local `dist` / `file:` path in their `package.json`.

## Fragile mechanics

- **Never** rely on `postinstall` scripts (or similar) that rewrite another package’s `package.json` or patch `node_modules` to adapt it.
- If a packaging approach is too fragile, abandon it and choose a stable alternative (proper package API, peer deps, fork, or redesign).

## i18n

- Default English for any user-facing strings shipped from this kit; follow Angular i18n patterns expected by consumers.

## Commits / push

Only when the developer explicitly asks.
