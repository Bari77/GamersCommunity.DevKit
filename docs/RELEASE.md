# DevKit publishing (tags → Release + npm + image)

## Versioning: lockstep

Every `@bari77/gc-*` package shares one version, driven by the tag. A `vX.Y.Z` tag publishes all
seven packages at `X.Y.Z`, even the ones whose content did not change — same model as `@angular/*`.

Consequences:

- **Consumers must pin every `@bari77/*` dependency to the same version.** Mixing
  `gc-ui@0.8.1` with `gc-theme@0.4.2` is not a supported combination, even when it happens to work.
- The `version` field in each `packages/*/package.json` is kept in sync with the last published tag.
  The workflow overwrites it at publish time, so it is documentation rather than the source of truth.
- Cross-package deps (`gc-msw` → `gc-sdk`) stay `"*"` in source; the workflow pins them to the tag.

There is no per-package release. If only `gc-ui` changed, still cut a full tag.

## Principle

Pushing a `vX.Y.Z` tag runs `.github/workflows/release.yml`:

1. Pin package versions from the tag, then `npm install` (workspace packages keep `"@bari77/gc-sdk": "*"` in source; the workflow rewrites that to `X.Y.Z` before publish)
2. Publish npm packages to **GitHub Packages**
   - `@bari77/gc-sdk`
   - `@bari77/gc-msw`
   - `@bari77/gc-playground`
   - `@bari77/gc-ui`
   - `@bari77/gc-widgets`
   - `@bari77/gc-theme`
   - `@bari77/gc-create-game` (clones `GamersCommunity.Games.Template` at runtime — no template bundled in the package)
3. Build & push image **`ghcr.io/bari77/gc-devgateway:X.Y.Z`**
4. Create a **GitHub Release**

> npm scope = GitHub owner (`Bari77`). Hence `@bari77/gc-*` rather than `@gamerscommunity/*`.  
> If you later create a `gamerscommunity` organization, the scope can be renamed.

## Publish

```bash
git tag v0.3.1
git push origin v0.3.1
```

**Recommended order**: publish a **Core** tag first (NuGet `GamersCommunity.Core`) before DevKit, because the DevGateway image restores that package. Keep `GamersCommunity.Games.Template` `main` usable before publishing a create-game that clones it.

## Consume (game teams)

### npm

Front `.npmrc`:

```
@bari77:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```powershell
$env:NODE_AUTH_TOKEN = "ghp_xxx"   # PAT read:packages
npm install
```

```json
{
  "dependencies": {
    "@bari77/gc-sdk": "0.8.1",
    "@bari77/gc-msw": "0.8.1",
    "@bari77/gc-playground": "0.8.1"
  }
}
```

Pin exact versions, and keep them identical across every `@bari77/*` entry — see the lockstep
section above.

### Create a game

```bash
npx @bari77/gc-create-game YourGame
# clones Bari77/GamersCommunity.Games.Template (main), renames Template → YourGame
```

### DevGateway (game-full)

```yaml
devgateway:
  image: ghcr.io/bari77/gc-devgateway:latest
  # or pin: ghcr.io/bari77/gc-devgateway:0.3.1 / DEVGATEWAY_VERSION=0.3.1
```

```powershell
echo $env:GITHUB_TOKEN | docker login ghcr.io -u USER --password-stdin
```

### Game team layout

```text
npx @bari77/gc-create-game YourGame
(+ GitHub Packages / GHCR auth)
# no Core, no prod Gateway, no shell Front
```

Platform leads keep Core / Front / Gateway / Local.
