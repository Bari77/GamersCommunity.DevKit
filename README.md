# GamersCommunity.DevKit

Local kit for game teams: DevGateway, npm packages (`@bari77/gc-*`), game scaffold CLI.

## Component gallery

**https://bari77.github.io/GamersCommunity.DevKit/** — live demos, integration snippets and API tables
for `gc-ui`, `gc-theme` and `gc-widgets`. Deployed from `main` by
[`.github/workflows/docs.yml`](.github/workflows/docs.yml).

```bash
npm install
npm run docs         # serves the gallery on http://localhost:4300
```

`apps/docs/src/app/docs.config.ts` is the single source of truth: routes, sidebar, breadcrumb
labels, page headers and landing-page cards are all derived from the tree it declares, and the
version and peer ranges are read from the package manifests. Adding a page means one entry there
plus a component holding its prose.

## Create a new game

```bash
npx @bari77/gc-create-game StarCraft
# → shallow-clones Bari77/GamersCommunity.Games.Template (main),
#   renames Template → StarCraft, writes ./GamersCommunity.Games.StarCraft/
```

Works from the parent folder or from an already-cloned `GamersCommunity.Games.StarCraft` that only has `.git` + a stub README.

Requires `git` on PATH and a user `.npmrc` that points `@bari77` at GitHub Packages (`NODE_AUTH_TOKEN` with `read:packages`). `npx` does not see a game Front `.npmrc`. The template repo itself is public-cloneable over HTTPS once published.

```
@bari77:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

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
"@bari77/gc-sdk": "0.3.1",
"@bari77/gc-msw": "0.3.1",
"@bari77/gc-playground": "0.3.1"
```

```yaml
image: ghcr.io/bari77/gc-devgateway:latest
```
