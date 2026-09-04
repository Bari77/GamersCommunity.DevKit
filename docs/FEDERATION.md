# Module Federation — ce que c’est (et ce que ce n’est pas)

## Pas des iframes

Native Federation charge du **JavaScript/TypeScript** (bundles Angular) dans **la même page** que le shell.

- Même document HTML, même CSS cascade possible, même router Angular
- Communication = imports, services partagés, events — pas `postMessage` cross-frame
- Performance proche d’un lazy-load de routes classiques

Les iframes isolent un document entier (lourd, SEO/a11y/design difficiles). Ce n’est **pas** le modèle utilisé.

## Pas non plus des Web Components (obligatoires)

On peut exposer des composants Angular ; le contrat actuel expose surtout des **routes** (`./Routes`) montées dans le shell via `loadRemoteModule`.

C’est un **micro-frontend** : un remote déployable indépendamment, composé au runtime dans l’app hôte.

## À quoi ça sert ici

| Objectif | Federation |
|----------|------------|
| Séparer les équipes (Shell vs WoW vs …) | Oui |
| Déployer un jeu sans republier tout le shell | Oui (URL `remoteEntry`) |
| Site réactif type SPA | Oui (pas d’iframe) |
| Isoler totalement CSS/JS comme un widget tiers | Non (partage du runtime Angular) |

## Flux

```
Shell (host)  --loadRemoteModule-->  remoteEntry.json du jeu
                                    expose ./Routes
                                    → routes Angular montées sous /world-of-warcraft
```

Le remote peut tourner **seul** (playground) pour l’équipe jeu ; le shell ne fait que le référencer à l’intégration.
