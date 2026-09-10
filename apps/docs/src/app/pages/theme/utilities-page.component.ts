import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-utilities-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent],
    template: `
        <gcd-page
            lead="Un lot volontairement minuscule de classes d'appoint, plus l'habillage des barres de défilement et de la coquille Nebular."
        >
            <p>
                Ce n'est pas un framework utilitaire : il n'y a ici que les quelques classes qui revenaient assez
                souvent pour mériter d'être partagées. Tout le reste relève des styles du composant qui en a besoin.
            </p>

            <h2>Classes</h2>

            <gcd-api [rows]="classes" [showDefault]="false" />

            <gcd-demo title="flex-end" description="Aligne les actions d'une barre à droite." [html]="flexHtml" [bare]="true">
                <div class="gcd-bar flex-end">
                    <span class="gcd-chip">Annuler</span>
                    <span class="gcd-chip gcd-chip--accent">Enregistrer</span>
                </div>
            </gcd-demo>

            <h2>Barres de défilement</h2>

            <p>
                Le fichier <code>scrollbar</code> restyle toutes les barres de défilement de l'application, sur le
                sélecteur universel. Le pouce reprend un dégradé des deux accents, la piste s'appuie sur
                <code>--gc-surface-1</code> : redéfinir les tokens suffit donc à réaccorder les barres.
            </p>

            <p>
                La règle couvre à la fois la propriété standard <code>scrollbar-color</code> et les pseudo-éléments
                <code>::-webkit-scrollbar</code>, ce qui donne un rendu proche sur Firefox et sur les navigateurs
                Chromium.
            </p>

            <h2>Coquille Nebular</h2>

            <p>
                Le fichier <code>shell</code> corrige l'habillage de l'en-tête et du pied de page Nebular : il
                remonte leur <code>z-index</code> à 1040 et réapplique les polices du DevKit par-dessus le thème
                <code>cosmic</code>, qui impose autrement Open Sans.
            </p>

            <gcd-code language="scss" label="Extrait de _shell.scss" [code]="shellSnippet" />

            <div class="gcd-note">
                <p>
                    Ces règles ciblent des balises Nebular. Dans une application qui n'utilise pas Nebular, elles ne
                    correspondent à rien et restent sans effet — il n'y a donc pas de raison d'éviter l'import
                    global.
                </p>
            </div>
        </gcd-page>
    `,
    styles: [
        `
            .gcd-bar {
                display: flex;
                gap: 0.5rem;
                width: 100%;
                padding: 0.6rem;
                border: 1px dashed var(--gcd-border);
                border-radius: 0.4rem;
            }

            .gcd-chip {
                padding: 0.3rem 0.7rem;
                border: 1px solid var(--gcd-border);
                border-radius: 0.3rem;
                font-size: 0.78rem;
                color: #c9d4ea;
            }

            .gcd-chip--accent {
                border-color: var(--gc-accent);
                color: var(--gc-accent);
            }
        `,
    ],
})
export class UtilitiesPageComponent {
    protected readonly flexHtml = `<div class="actions flex-end">
    <button type="button">Annuler</button>
    <button type="button">Enregistrer</button>
</div>`;

    protected readonly shellSnippet = `nb-layout-header.fixed {
    z-index: 1040;
}

.nb-theme-cosmic nb-layout-header,
nb-layout-header {
    font-family: var(--gc-font-body);
}`;

    protected readonly classes: ApiRow[] = [
        { name: '.ml-sm', type: 'espacement', description: 'Applique une marge à gauche de 1rem.' },
        { name: '.flex-end', type: 'alignement', description: 'Pousse le contenu à droite via justify-content.' },
        {
            name: 'nb-card-header > *',
            type: 'règle globale',
            description: "Donne 0.5rem de marge horizontale aux enfants directs d'un en-tête de carte Nebular.",
        },
    ];
}
