# Architecture DevKit

## Rôle

Fondations partagées pour qu’une équipe jeu développe **Front + Back** sans cloner la plateforme (Core en sibling, Gateway prod, Shell).

## Modes

| Mode | Repos | Runtime |
|------|-------|---------|
| **UI-only** | Jeu seul | MSW (`@bari77/gc-msw`) |
| **Game-full** | Jeu seul | Compose : Rabbit + SQL + consumer + image `gc-devgateway` |
| **Platform** | Shell + Local + … | Intégration federation / auth réelle |

## Packages

| Artefact | Registry |
|----------|----------|
| `@bari77/gc-sdk` / `gc-msw` / `gc-playground` | GitHub Packages (npm) |
| `GamersCommunity.Core*` | GitHub Packages (NuGet) — repo Core |
| `ghcr.io/bari77/gc-devgateway` | GHCR |

Publication : push de tag `v*` → voir [RELEASE.md](./RELEASE.md).

Fédération (pas d’iframes) : [FEDERATION.md](./FEDERATION.md).

## Flux DevGateway

```
Front → HTTP /api/{ms}/… → DevGateway (fake Caller) → RabbitMQ → Consumer jeu
```

Même contrat d’URL que le Gateway prod ; auth OIDC désactivée.

## Onboarding équipe jeu

1. Clone `GamersCommunity.Games.<YourGame>`
2. PAT `read:packages` → NuGet + npm + pull GHCR
3. `npm start` (mocks) ou `compose up` + `npm run start:api`
4. Contrat federation / OpenAPI → équipe Shell pour brancher le remote
