# GamersCommunity.DevKit

Kit local pour les équipes jeu : DevGateway, packages npm (`@bari77/gc-*`), templates.

## Publication

Voir [docs/RELEASE.md](docs/RELEASE.md) — **tag `vX.Y.Z` → Release + npm + image GHCR**.

Architecture : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Developper sur DevKit (leads)

```bash
npm install
dotnet restore
dotnet run --project src/DevGateway
```

Authentification GitHub Packages requise pour restaurer `GamersCommunity.Core` (NuGet).

## Consommer depuis un jeu

Pas de `file:` / sibling. Versions publiées :

```json
"@bari77/gc-sdk": "0.1.0",
"@bari77/gc-msw": "0.1.0",
"@bari77/gc-playground": "0.1.0"
```

```yaml
image: ghcr.io/bari77/gc-devgateway:0.1.0
```
