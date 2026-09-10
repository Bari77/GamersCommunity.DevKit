import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';

interface Swatch {
    token: string;
    value: string;
    preview: string;
}

@Component({
    selector: 'gcd-tokens-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-theme"
            heading="Tokens"
            lead="Les variables CSS posées sur :root par le thème. Tout le reste du DevKit s'y réfère, ce qui rend l'habillage modifiable sans recompiler le SCSS."
        >
            <h2>Couleurs</h2>

            <div class="gcd-swatches">
                @for (swatch of colors; track swatch.token) {
                    <div class="gcd-swatch">
                        <div class="gcd-swatch__preview" [style.background]="swatch.preview"></div>
                        <div class="gcd-swatch__body">
                            <span class="gcd-swatch__name">{{ swatch.token }}</span>
                            <span class="gcd-swatch__value">{{ swatch.value }}</span>
                        </div>
                    </div>
                }
            </div>

            <h2>Liste complète</h2>

            <gcd-api [rows]="tokens" />

            <h2>Accent par jeu</h2>

            <p>
                <code>--game-accent</code> vaut <code>var(--gc-accent)</code> par défaut. Un module de jeu le
                redéfinit pour teinter son espace sans toucher au reste de la plateforme : les composants qui
                utilisent cette variable, comme la pulsation de <code>gc-pulse-new</code>, suivent automatiquement.
            </p>

            <gcd-code language="scss" label="Dans le module de jeu" [code]="overrideSnippet" />

            <h2>Consommer un token</h2>

            <p>
                Les tokens s'utilisent comme n'importe quelle variable CSS, y compris dans les styles encapsulés d'un
                composant, puisqu'ils sont déclarés sur <code>:root</code>.
            </p>

            <gcd-code language="scss" [code]="usageSnippet" />

            <div class="gcd-note">
                <p>
                    Les tokens sont des variables CSS, pas des variables Sass : elles sont résolues par le
                    navigateur. On peut donc les surcharger à l'exécution, par exemple en posant une classe de thème
                    sur <code>&lt;body&gt;</code>, ce qu'une variable Sass ne permettrait pas.
                </p>
            </div>
        </gcd-page>
    `,
})
export class TokensPageComponent {
    protected readonly colors: Swatch[] = [
        { token: '--gc-accent', value: '#2ee6a6', preview: '#2ee6a6' },
        { token: '--gc-accent-2', value: '#3dd6ff', preview: '#3dd6ff' },
        { token: '--gc-surface-0', value: '#070b14', preview: '#070b14' },
        { token: '--gc-surface-1', value: '#0e1524', preview: '#0e1524' },
        { token: '--gc-surface-2', value: '#162033', preview: '#162033' },
        { token: '--gc-discriminator', value: 'rgb(137 137 227)', preview: 'rgb(137 137 227)' },
    ];

    protected readonly tokens: ApiRow[] = [
        { name: '--gc-accent', type: 'couleur', default: '#2ee6a6', description: 'Accent principal de la plateforme.' },
        {
            name: '--gc-accent-2',
            type: 'couleur',
            default: '#3dd6ff',
            description: 'Accent secondaire, utilisé pour les liens et les dégradés.',
        },
        { name: '--gc-surface-0', type: 'couleur', default: '#070b14', description: 'Fond de page.' },
        { name: '--gc-surface-1', type: 'couleur', default: '#0e1524', description: 'Fond des cartes et panneaux.' },
        {
            name: '--gc-surface-2',
            type: 'couleur',
            default: '#162033',
            description: 'Fond des éléments posés sur une carte.',
        },
        {
            name: '--game-accent',
            type: 'couleur',
            default: 'var(--gc-accent)',
            description: "Accent du jeu courant, redéfini par chaque module.",
        },
        {
            name: '--gc-font-display',
            type: 'police',
            default: '"Orbitron", sans-serif',
            description: 'Police des titres et des éléments de marque.',
        },
        {
            name: '--gc-font-body',
            type: 'police',
            default: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            description: 'Police du texte courant.',
        },
        {
            name: '--gc-discriminator',
            type: 'couleur',
            default: 'rgb(137 137 227)',
            description: 'Couleur du discriminant affiché après un pseudonyme.',
        },
        {
            name: '--gc-card-list-gap',
            type: 'espacement',
            default: '0.5rem',
            description: 'Écart entre deux cartes empilées en liste.',
        },
        {
            name: '--gc-card-grid-gap',
            type: 'espacement',
            default: '1rem',
            description: 'Écart entre deux cartes disposées en grille.',
        },
    ];

    protected readonly overrideSnippet = `:root {
    --game-accent: #f8b700;
}`;

    protected readonly usageSnippet = `.player-card {
    background: var(--gc-surface-1);
    border: 1px solid var(--gc-surface-2);
    gap: var(--gc-card-list-gap);
}

.player-card__name {
    font-family: var(--gc-font-display);
    color: var(--game-accent);
}`;
}
