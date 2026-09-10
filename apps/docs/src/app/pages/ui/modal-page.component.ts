import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalComponent } from '@bari77/gc-ui';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-modal-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, ModalComponent],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-ui"
            heading="Modal"
            selector="gc-modal"
            lead="Panneau centré en surimpression qui accueille un contenu projeté et laisse à l'appelant la maîtrise de son ouverture."
            [importSnippet]="importSnippet"
        >
            <p>
                Le composant ne décide jamais seul de se fermer : il signale une intention de fermeture par
                <code>dismissed</code>, et c'est l'appelant qui repasse <code>open</code> à <code>false</code>. Ce
                détour permet de retenir la fermeture, par exemple pendant l'enregistrement d'un formulaire.
            </p>

            <gcd-demo title="Modale renvoyable" [html]="basicHtml" [ts]="basicTs">
                <button type="button" class="gcd-demo-button" (click)="open.set(true)">Ouvrir la modale</button>

                <gc-modal [open]="open()" ariaLabel="Exemple de modale" (dismissed)="open.set(false)">
                    <h2 class="gcd-modal-title">Rejoindre la guilde</h2>
                    <p class="gcd-modal-text">
                        Cliquez en dehors du panneau ou appuyez sur Échap : le composant émet
                        <code>dismissed</code>, et c'est la page qui referme.
                    </p>
                    <button type="button" class="gcd-demo-button" (click)="open.set(false)">Fermer</button>
                </gc-modal>
            </gcd-demo>

            <gcd-demo
                title="Modale bloquante"
                description="Avec dismissible à false, ni le fond ni la touche Échap ne ferment le panneau."
                [html]="blockingHtml"
            >
                <button type="button" class="gcd-demo-button" (click)="blocking.set(true)">
                    Ouvrir une modale bloquante
                </button>

                <gc-modal [open]="blocking()" [dismissible]="false" ariaLabel="Traitement en cours">
                    <h2 class="gcd-modal-title">Transfert en cours</h2>
                    <p class="gcd-modal-text">Seule une action du panneau peut refermer cette modale.</p>
                    <button type="button" class="gcd-demo-button" (click)="blocking.set(false)">Terminer</button>
                </gc-modal>
            </gcd-demo>

            <h2>API</h2>

            <gcd-api heading="Entrées" [rows]="inputs" />

            <gcd-api heading="Sorties" [rows]="outputs" [showDefault]="false" />

            <h2>Comportement</h2>

            <ul>
                <li>
                    à l'ouverture, le panneau prend le focus, ce qui donne un point de départ correct à la navigation
                    au clavier ;
                </li>
                <li>
                    le panneau porte <code>role="dialog"</code> et <code>aria-modal="true"</code>, et reprend
                    <code>ariaLabel</code> comme étiquette accessible ;
                </li>
                <li>
                    la touche Échap est écoutée au niveau du document, donc elle fonctionne sans que le focus soit
                    dans le panneau ;
                </li>
                <li>
                    <code>dismissed</code> transporte l'origine de la demande, <code>'backdrop'</code> ou
                    <code>'escape'</code>, si vous voulez les traiter différemment.
                </li>
            </ul>

            <div class="gcd-note">
                <p>
                    Rien n'est rendu tant que <code>open</code> vaut <code>false</code> : le contenu projeté n'est ni
                    créé ni initialisé, il est donc inutile de le conditionner vous-même.
                </p>
            </div>
        </gcd-page>
    `,
    styles: [
        `
            .gcd-demo-button {
                padding: 0.45rem 0.9rem;
                border: 1px solid var(--gc-accent);
                border-radius: 0.35rem;
                background: transparent;
                color: var(--gc-accent);
                font: inherit;
                font-size: 0.8125rem;
                cursor: pointer;
            }

            .gcd-modal-title {
                margin: 0 0 0.6rem;
                font-size: 1.1rem;
            }

            .gcd-modal-text {
                margin: 0 0 1rem;
                font-size: 0.875rem;
                color: #c9d4ea;
            }
        `,
    ],
})
export class ModalPageComponent {
    protected readonly open = signal(false);
    protected readonly blocking = signal(false);

    protected readonly importSnippet = `import { ModalComponent } from '@bari77/gc-ui';`;

    protected readonly basicHtml = `<button type="button" (click)="open.set(true)">Ouvrir la modale</button>

<gc-modal [open]="open()" ariaLabel="Rejoindre la guilde" (dismissed)="open.set(false)">
    <h2>Rejoindre la guilde</h2>
    <p>Votre demande sera visible par les officiers.</p>
    <button type="button" (click)="open.set(false)">Fermer</button>
</gc-modal>`;

    protected readonly basicTs = `export class GuildSheetComponent {
    protected readonly open = signal(false);
}`;

    protected readonly blockingHtml = `<gc-modal [open]="saving()" [dismissible]="false" ariaLabel="Transfert en cours">
    <h2>Transfert en cours</h2>
    <p>Seule une action du panneau peut refermer cette modale.</p>
</gc-modal>`;

    protected readonly inputs: ApiRow[] = [
        {
            name: 'open',
            type: 'boolean',
            default: 'false',
            description: "Pilote l'affichage. Rien n'est rendu tant qu'il vaut false.",
        },
        {
            name: 'ariaLabel',
            type: 'string',
            default: "''",
            description: 'Étiquette accessible du panneau.',
        },
        {
            name: 'dismissible',
            type: 'boolean',
            default: 'true',
            description: 'À false, le fond et la touche Échap cessent de demander la fermeture.',
        },
    ];

    protected readonly outputs: ApiRow[] = [
        {
            name: 'dismissed',
            type: "OutputEmitterRef<'backdrop' | 'escape'>",
            description:
                "Demande de fermeture émise par le fond ou par la touche Échap. La fermeture effective reste à la charge de l'appelant.",
        },
    ];
}
