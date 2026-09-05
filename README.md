# GamersCommunity.DevKit

Local kit for game teams: DevGateway, npm packages (`@bari77/gc-*`), templates.

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

## Consuming from a game

No `file:` / sibling links. Use published versions:

```json
"@bari77/gc-sdk": "0.1.0",
"@bari77/gc-msw": "0.1.0",
"@bari77/gc-playground": "0.1.0"
```

```yaml
image: ghcr.io/bari77/gc-devgateway:0.1.0
```
