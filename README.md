# GamersCommunity.DevKit

Local kit for game teams: DevGateway, npm packages (`@bari77/gc-*`), game scaffold CLI, templates.

## Create a new game

```bash
npx @bari77/gc-create-game StarCraft
# → ./GamersCommunity.Games.StarCraft/ (Front + Consumer + Database + compose)
```

Requires GitHub Packages auth (`NODE_AUTH_TOKEN` with `read:packages`) to run `npx` against `@bari77/*`.

## Publishing

See [docs/RELEASE.md](docs/RELEASE.md) — **tag `vX.Y.Z` → Release + npm + GHCR image**.

Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Developing DevKit (leads)

```bash
npm install
dotnet restore
dotnet run --project src/DevGateway
```

GitHub Packages authentication is required to restore `GamersCommunity.Core` (NuGet).

## Consuming packages from a game

No `file:` / sibling links. Use published versions:

```json
"@bari77/gc-sdk": "0.3.0",
"@bari77/gc-msw": "0.3.0",
"@bari77/gc-playground": "0.3.0"
```

```yaml
image: ghcr.io/bari77/gc-devgateway:0.3.0
```
