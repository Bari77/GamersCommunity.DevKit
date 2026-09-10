import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-motion-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-theme"
            heading="Animations"
            lead="Deux keyframes et les classes qui les appliquent : une entrée en fondu montant, et une pulsation pour signaler une nouveauté."
        >
            <p>
                Ce sont des animations CSS, pas des animations Angular : aucun import de
                <code>&#64;angular/animations</code> n'est nécessaire, il suffit de poser la classe.
            </p>

            <gcd-demo
                title="Entrée en cascade"
                description="Les classes de délai décalent l'apparition pour donner du rythme à une liste."
                [html]="enterHtml"
                [bare]="true"
            >
                <button type="button" class="gcd-demo-button" (click)="replay()">Rejouer</button>

                @if (visible()) {
                    <div class="gcd-motion-row">
                        <div class="gcd-motion-card gc-enter">Sans délai</div>
                        <div class="gcd-motion-card gc-enter gc-enter-delay-1">Délai 1</div>
                        <div class="gcd-motion-card gc-enter gc-enter-delay-2">Délai 2</div>
                        <div class="gcd-motion-card gc-enter gc-enter-delay-3">Délai 3</div>
                    </div>
                }
            </gcd-demo>

            <gcd-demo title="Pulsation de nouveauté" description="La halo suit --game-accent, donc la couleur du jeu courant." [html]="pulseHtml">
                <div class="gcd-motion-card gc-pulse-new">Nouveau</div>
            </gcd-demo>

            <h2>Classes disponibles</h2>

            <gcd-api [rows]="classes" [showDefault]="false" />

            <h2>Keyframes</h2>

            <p>
                Les deux keyframes sont exposés globalement, donc réutilisables dans vos propres règles sans
                redéfinir l'animation.
            </p>

            <gcd-code language="scss" [code]="keyframesSnippet" />

            <div class="gcd-note">
                <p>
                    <code>gc-enter</code> utilise <code>animation-fill-mode: both</code> : l'élément est donc
                    invisible avant le début de l'animation. Sur un contenu dont l'affichage est différé, appliquez
                    la classe au moment du rendu, sinon le délai s'écoule sur un élément déjà présent.
                </p>
            </div>
        </gcd-page>
    `,
    styles: [
        `
            .gcd-demo-button {
                align-self: flex-start;
                padding: 0.4rem 0.85rem;
                border: 1px solid var(--gc-accent);
                border-radius: 0.35rem;
                background: transparent;
                color: var(--gc-accent);
                font: inherit;
                font-size: 0.8125rem;
                cursor: pointer;
            }

            .gcd-motion-row {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                margin-top: 1rem;
            }

            .gcd-motion-card {
                padding: 0.85rem 1.1rem;
                border: 1px solid var(--gcd-border);
                border-radius: 0.45rem;
                background: var(--gc-surface-1);
                font-size: 0.8125rem;
                color: #c9d4ea;
            }
        `,
    ],
})
export class MotionPageComponent {
    protected readonly visible = signal(true);

    protected replay(): void {
        this.visible.set(false);
        setTimeout(() => this.visible.set(true), 60);
    }

    protected readonly enterHtml = `<div class="gc-enter">Sans délai</div>
<div class="gc-enter gc-enter-delay-1">Délai 1</div>
<div class="gc-enter gc-enter-delay-2">Délai 2</div>
<div class="gc-enter gc-enter-delay-3">Délai 3</div>`;

    protected readonly pulseHtml = `<span class="badge gc-pulse-new">Nouveau</span>`;

    protected readonly keyframesSnippet = `.player-card--highlighted {
    animation: gc-fade-up 0.55s ease both;
}

.player-card--live {
    animation: gc-pulse-accent 2s ease-in-out infinite;
}`;

    protected readonly classes: ApiRow[] = [
        {
            name: '.gc-enter',
            type: 'animation',
            description: "Fondu montant de 0.55s, avec fill-mode both : l'élément est masqué avant de démarrer.",
        },
        { name: '.gc-enter-delay-1', type: 'délai', description: 'Retarde le départ de 0.08s.' },
        { name: '.gc-enter-delay-2', type: 'délai', description: 'Retarde le départ de 0.16s.' },
        { name: '.gc-enter-delay-3', type: 'délai', description: 'Retarde le départ de 0.24s.' },
        {
            name: '.gc-pulse-new',
            type: 'animation',
            description: 'Halo pulsé en boucle de 2s, teinté par --game-accent.',
        },
        {
            name: 'gc-fade-up',
            type: 'keyframes',
            description: "Passe d'une opacité nulle et d'un décalage d'1rem vers la position finale.",
        },
        {
            name: 'gc-pulse-accent',
            type: 'keyframes',
            description: "Fait croître puis disparaître une ombre portée colorée autour de l'élément.",
        },
    ];
}
