# Module Federation — what it is (and is not)

## Not iframes

Native Federation loads **JavaScript/TypeScript** (Angular bundles) into **the same page** as the shell.

- Same HTML document, shared CSS cascade possible, same Angular router
- Communication = imports, shared services, events — not cross-frame `postMessage`
- Performance close to classic lazy-loaded routes

Iframes isolate an entire document (heavy; SEO/a11y/design are harder). That is **not** the model used here.

## Design (Nebular) in the playground

The shell owns `NbThemeModule.forRoot()`. The remote **must not** call it in federated routes.

In **standalone** (playground), the remote may initialize Nebular in its own `app.config` (`providePlaygroundUi`): that config is **not** executed when the shell only loads `./Routes`.

## Not mandatory Web Components either

Angular components can be exposed; the current contract mainly exposes **routes** (`./Routes`) mounted in the shell via `loadRemoteModule`.

This is a **micro-frontend**: an independently deployable remote, composed at runtime into the host app.

## Why it matters here

| Goal | Federation |
|------|------------|
| Split teams (Shell vs WoW vs …) | Yes |
| Deploy a game without republishing the whole shell | Yes (`remoteEntry` URL) |
| SPA-like reactive site | Yes (no iframe) |
| Fully isolate CSS/JS like a third-party widget | No (shared Angular runtime) |

## Flow

```
Shell (host)  --loadRemoteModule-->  game remoteEntry.json
                                    exposes ./Routes
                                    → Angular routes mounted under /world-of-warcraft
```

The remote can run **alone** (playground) for the game team; the shell only references it at integration time.
