# Publication DevKit (tags → Release + npm + image)

## Principe

Push d’un tag `vX.Y.Z` → workflow `.github/workflows/release.yml` :

1. Publie les packages npm sur **GitHub Packages**
   - `@bari77/gc-sdk`
   - `@bari77/gc-msw`
   - `@bari77/gc-playground`
2. Build & push l’image **`ghcr.io/bari77/gc-devgateway:X.Y.Z`**
3. Crée une **GitHub Release**

> Scope npm = owner GitHub (`Bari77`). D’où `@bari77/gc-*` plutôt que `@gamerscommunity/*`.  
> Si vous créez plus tard l’organisation `gamerscommunity`, on pourra renommer le scope.

## Publier

```bash
git tag v0.2.0
git push origin v0.2.0
```

**Ordre recommandé** : publier d’abord un tag **Core** (NuGet `GamersCommunity.Core`) avant DevKit, car l’image DevGateway restaure ce package.

## Consommer (équipes jeu)

### npm

`.npmrc` dans le Front :

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

### Layout équipe jeu

```text
clone GamersCommunity.Games.<YourGame>
(+ auth GitHub Packages / GHCR)
# pas de Core, pas de Gateway prod, pas de Front shell
```

Les leads plateforme gardent Core / Front / Gateway / Local.
