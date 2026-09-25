# Agent guidelines — DevKit

Shared module: [`AgentKit/`](AgentKit/) → [GamersCommunity.AgentKit](https://github.com/Bari77/GamersCommunity.AgentKit)

- [`AgentKit/AGENTS.base.md`](AgentKit/AGENTS.base.md)
- [`AgentKit/ENGINEERING_STANDARDS.md`](AgentKit/ENGINEERING_STANDARDS.md)
- [`AgentKit/POLICY.md`](AgentKit/POLICY.md)
- Optional: [`AGENTS.override.md`](AGENTS.override.md)

## Repo-specific

- Shared Angular packages (`gc-ui`, `gc-widgets`, `gc-sdk`, …), CLI, DevGateway image, and kit docs live here.
- Consumers must use **published** lockstep `@bari77/*` versions — never instruct `file:` / local `dist`.
- Package architecture / federation / release details: `docs/` in this repo (not AgentKit).
- After AgentKit submodule updates: `./AgentKit/scripts/Sync-CursorRules.ps1`.
