# DevKit architecture

## Role

Shared foundations so a game team can develop **Front + Back** without cloning the platform (sibling Core, prod Gateway, Shell).

## Modes

| Mode | Repos | Runtime |
|------|-------|---------|
| **UI-only** | Game only | MSW (`@bari77/gc-msw`) |
| **Game-full** | Game only | Compose: Rabbit + SQL + consumer + `gc-devgateway` image |
| **Platform** | Shell + Local + … | Real federation / auth integration |

## Packages

| Artefact | Registry |
|----------|----------|
| `@bari77/gc-sdk` / `gc-msw` / `gc-playground` | GitHub Packages (npm) |
| `GamersCommunity.Core*` | GitHub Packages (NuGet) — Core repo |
| `ghcr.io/bari77/gc-devgateway` | GHCR |

Publishing: push a `v*` tag → see [RELEASE.md](./RELEASE.md).

Federation (no iframes): [FEDERATION.md](./FEDERATION.md).

## DevGateway flow

```
Front → HTTP /api/{ms}/… → DevGateway (fake Caller) → RabbitMQ → game Consumer
```

Same URL contract as the prod Gateway; OIDC auth is disabled.

## Game team onboarding

1. Clone `GamersCommunity.Games.<YourGame>`
2. PAT `read:packages` → NuGet + npm + GHCR pull
3. `npm start` (mocks) or `compose up` + `npm run start:api`
4. Federation / OpenAPI contract → Shell team wires the remote
