import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DecisionPromptComponent } from '@bari77/gc-ui';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-decision-prompt-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, DecisionPromptComponent],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-ui"
            heading="Decision prompt"
            selector="gc-decision-prompt"
            lead="Modale de choix entre un engagement principal et la poursuite sans lui, avec une case « ne plus demander » que l'application est chargée de mémoriser."
            [importSnippet]="importSnippet"
        >
            <p>
                Le composant s'appuie sur <code>gc-modal</code> et lui ajoute l'ossature d'une décision : un titre, un
                message, deux boutons et, si besoin, une case de renoncement. Il ne persiste rien lui-même —
                l'application décide de ce que signifie la case cochée et de l'endroit où elle est stockée.
            </p>

            <gcd-demo title="Décision simple" [html]="basicHtml" [ts]="basicTs">
                <button type="button" class="gcd-demo-button" (click)="open.set(true)">Proposer la décision</button>

                <gc-decision-prompt
                    [open]="open()"
                    heading="Créer un personnage ?"
                    message="Vous pourrez suivre votre progression et rejoindre une guilde."
                    primaryLabel="Créer un personnage"
                    secondaryLabel="Plus tard"
                    optOutLabel="Ne plus me le proposer"
                    [(optOut)]="optOut"
                    (primary)="open.set(false)"
                    (secondary)="open.set(false)"
                />

                <p class="gcd-state">
                    Case « ne plus demander » : <strong>{{ optOut() ? "cochée" : "décochée" }}</strong>
                </p>
            </gcd-demo>

            <gcd-demo
                title="Action principale en cours"
                description="Pendant que busy est vrai, les boutons sont désactivés, la modale n'est plus renvoyable et le libellé principal est remplacé."
                [html]="busyHtml"
            >
                <button type="button" class="gcd-demo-button" (click)="startBusy()">Lancer une décision longue</button>

                <gc-decision-prompt
                    [open]="busyOpen()"
                    [busy]="busy()"
                    heading="Rejoindre le raid ?"
                    message="Votre place sera réservée pendant dix minutes."
                    primaryLabel="Réserver ma place"
                    busyLabel="Réservation…"
                    secondaryLabel="Annuler"
                    (primary)="confirmBusy()"
                    (secondary)="busyOpen.set(false)"
                />
            </gcd-demo>

            <h2>API</h2>

            <gcd-api heading="Entrées" [rows]="inputs" />

            <gcd-api heading="Sorties" [rows]="outputs" [showDefault]="false" />

            <h2>Contenu additionnel</h2>

            <p>
                Le contenu projeté vient s'insérer entre le message et la case de renoncement, ce qui permet de
                glisser un rappel ou un formulaire court sans réécrire la modale.
            </p>

            <gcd-code language="html" [code]="projectionSnippet" />

            <div class="gcd-note">
                <p>
                    Un renvoi par le fond ou par Échap déclenche <code>secondary</code> : traiter cette sortie comme
                    un refus explicite évite de laisser la modale ouverte.
                </p>
                <p>
                    <code>optOut</code> est un <code>model()</code>, donc il se lie dans les deux sens avec la syntaxe
                    <code>[(optOut)]</code>.
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

            .gcd-state {
                margin: 0;
                font-size: 0.8125rem;
                color: var(--gcd-text-dim);
            }
        `,
    ],
})
export class DecisionPromptPageComponent {
    protected readonly open = signal(false);
    protected readonly optOut = signal(false);
    protected readonly busyOpen = signal(false);
    protected readonly busy = signal(false);

    protected readonly importSnippet = `import { DecisionPromptComponent } from '@bari77/gc-ui';`;

    protected startBusy(): void {
        this.busy.set(false);
        this.busyOpen.set(true);
    }

    protected confirmBusy(): void {
        this.busy.set(true);
        setTimeout(() => {
            this.busy.set(false);
            this.busyOpen.set(false);
        }, 1800);
    }

    protected readonly basicHtml = `<gc-decision-prompt
    [open]="open()"
    heading="Créer un personnage ?"
    message="Vous pourrez suivre votre progression et rejoindre une guilde."
    primaryLabel="Créer un personnage"
    secondaryLabel="Plus tard"
    optOutLabel="Ne plus me le proposer"
    [(optOut)]="optOut"
    (primary)="createCharacter()"
    (secondary)="dismiss()"
/>`;

    protected readonly basicTs = `export class PlayerSheetComponent {
    protected readonly open = signal(false);
    protected readonly optOut = signal(false);

    protected dismiss(): void {
        if (this.optOut()) {
            this.preferences.rememberDecline('character-creation');
        }
        this.open.set(false);
    }
}`;

    protected readonly busyHtml = `<gc-decision-prompt
    [open]="open()"
    [busy]="saving()"
    heading="Rejoindre le raid ?"
    primaryLabel="Réserver ma place"
    busyLabel="Réservation…"
    secondaryLabel="Annuler"
    (primary)="book()"
    (secondary)="open.set(false)"
/>`;

    protected readonly projectionSnippet = `<gc-decision-prompt [open]="open()" heading="Supprimer la page ?" primaryLabel="Supprimer" secondaryLabel="Annuler">
    <ul class="consequences">
        <li>Les widgets de cette page seront perdus.</li>
        <li>Cette action est irréversible.</li>
    </ul>
</gc-decision-prompt>`;

    protected readonly inputs: ApiRow[] = [
        { name: 'open', type: 'boolean', default: 'false', description: "Pilote l'affichage de la modale." },
        { name: 'heading', type: 'string', default: "''", description: 'Titre de la décision.' },
        { name: 'message', type: 'string', default: "''", description: 'Phrase explicative, masquée si vide.' },
        { name: 'primaryLabel', type: 'string', default: "''", description: "Libellé de l'action d'engagement." },
        {
            name: 'secondaryLabel',
            type: 'string',
            default: "''",
            description: 'Libellé de la sortie sans engagement.',
        },
        {
            name: 'optOutLabel',
            type: 'string',
            default: "''",
            description: 'Libellé de la case de renoncement. Laissé vide, la case est masquée.',
        },
        {
            name: 'busyLabel',
            type: 'string',
            default: "''",
            description: "Libellé remplaçant le principal pendant l'exécution de l'action.",
        },
        {
            name: 'busy',
            type: 'boolean',
            default: 'false',
            description: 'Désactive les deux boutons, rend la modale non renvoyable et bascule sur busyLabel.',
        },
        {
            name: 'optOut',
            type: 'model<boolean>',
            default: 'false',
            description: "État de la case de renoncement, liable dans les deux sens. Sa persistance revient à l'appelant.",
        },
    ];

    protected readonly outputs: ApiRow[] = [
        { name: 'primary', type: 'OutputEmitterRef<void>', description: "L'utilisateur choisit de s'engager." },
        {
            name: 'secondary',
            type: 'OutputEmitterRef<void>',
            description: 'Sortie sans engagement, émise aussi par un renvoi au fond ou par Échap.',
        },
    ];
}
