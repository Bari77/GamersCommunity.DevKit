# DevKit publishing (tags → Release + npm + image)

## Principle

Pushing a `vX.Y.Z` tag runs `.github/workflows/release.yml`:

1. Publish npm packages to **GitHub Packages**
   - `@bari77/gc-sdk`
   - `@bari77/gc-msw`
   - `@bari77/gc-playground`
2. Build & push image **`ghcr.io/bari77/gc-devgateway:X.Y.Z`**
3. Create a **GitHub Release**

> npm scope = GitHub owner (`Bari77`). Hence `@bari77/gc-*` rather than `@gamerscommunity/*`.  
> If you later create a `gamerscommunity` organization, the scope can be renamed.

## Publish

```bash
git tag v0.2.0
git push origin v0.2.0
```

**Recommended order**: publish a **Core** tag first (NuGet `GamersCommunity.Core`) before DevKit, because the DevGateway image restores that package.

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
    "@bari77/gc-sdk": "0.2.0",
    "@bari77/gc-msw": "0.2.0",
    "@bari77/gc-playground": "0.2.0"
  }
}
```

### DevGateway (game-full)

```yaml
devgateway:
  image: ghcr.io/bari77/gc-devgateway:0.2.0
```

```powershell
echo $env:GITHUB_TOKEN | docker login ghcr.io -u USER --password-stdin
```

### Game team layout

```text
clone GamersCommunity.Games.<YourGame>
(+ GitHub Packages / GHCR auth)
# no Core, no prod Gateway, no shell Front
```

Platform leads keep Core / Front / Gateway / Local.
