import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CreateWallComponent } from '@bari77/gc-ui';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-create-wall-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, CreateWallComponent],
    template: `
        <gcd-page
            lead="Substitut d'une interaction que le visiteur ne peut pas encore atteindre, qui l'invite à franchir l'étape qui la débloque."
        >
            <p>
                Plutôt que de masquer une fonctionnalité indisponible ou d'afficher un message d'erreur, ce bloc
                occupe sa place et explique quoi faire pour y accéder : créer un personnage, se connecter, rejoindre
                une guilde.
            </p>

            <gcd-demo title="Variante block" description="Occupe la place du contenu absent, action comprise." [html]="blockHtml" [bare]="true">
                <gc-create-wall
                    heading="Aucun personnage sur ce royaume"
                    message="Créez un personnage pour suivre votre progression et rejoindre une guilde."
                    [actionLabel]="busy() ? '' : 'Créer un personnage'"
                    [busy]="busy()"
                    (action)="run()"
                />
            </gcd-demo>

            <gcd-demo
                title="Variante inline"
                description="Se glisse dans un flux existant, sans occuper toute la largeur."
                [html]="inlineHtml"
                [bare]="true"
            >
                <gc-create-wall
                    variant="inline"
                    message="Connectez-vous pour répondre à ce message."
                    actionLabel="Se connecter"
                />
            </gcd-demo>

            <gcd-demo title="Sans action" description="Sans actionLabel, le bloc se réduit à une explication." [html]="noActionHtml" [bare]="true">
                <gc-create-wall
                    variant="inline"
                    heading="Classement indisponible"
                    message="Le classement de la saison s'ouvrira à la fin de la période de qualification."
                />
            </gcd-demo>

            <h2>API</h2>

            <gcd-api heading="Entrées" [rows]="inputs" />

            <gcd-api heading="Sorties" [rows]="outputs" [showDefault]="false" />

            <h2>Contenu additionnel</h2>

            <p>
                Le contenu projeté s'insère sous le message, avant le bouton, ce qui permet d'ajouter une précision
                ou un lien secondaire.
            </p>

            <gcd-code language="html" [code]="projectionSnippet" />

            <div class="gcd-note">
                <p>
                    Pendant que <code>busy</code> est vrai, le bouton est désactivé et porte
                    <code>aria-busy</code>. Le composant ne remet jamais ce drapeau à faux tout seul : c'est
                    l'appelant qui le pilote au retour de son appel.
                </p>
            </div>
        </gcd-page>
    `,
})
export class CreateWallPageComponent {
    protected readonly busy = signal(false);

    protected run(): void {
        this.busy.set(true);
        setTimeout(() => this.busy.set(false), 1600);
    }

    protected readonly blockHtml = `<gc-create-wall
    heading="Aucun personnage sur ce royaume"
    message="Créez un personnage pour suivre votre progression et rejoindre une guilde."
    actionLabel="Créer un personnage"
    [busy]="creating()"
    (action)="createCharacter()"
/>`;

    protected readonly inlineHtml = `<gc-create-wall
    variant="inline"
    message="Connectez-vous pour répondre à ce message."
    actionLabel="Se connecter"
    (action)="goToLogin()"
/>`;

    protected readonly noActionHtml = `<gc-create-wall
    variant="inline"
    heading="Classement indisponible"
    message="Le classement de la saison s'ouvrira à la fin de la période de qualification."
/>`;

    protected readonly projectionSnippet = `<gc-create-wall heading="Guilde requise" actionLabel="Parcourir les guildes" (action)="browse()">
    <a routerLink="/help/guilds">Comment fonctionnent les guildes ?</a>
</gc-create-wall>`;

    protected readonly inputs: ApiRow[] = [
        { name: 'heading', type: 'string', default: "''", description: "Titre de l'invitation, masqué si vide." },
        { name: 'message', type: 'string', default: "''", description: 'Phrase explicative, masquée si vide.' },
        {
            name: 'actionLabel',
            type: 'string',
            default: "''",
            description: "Libellé de l'action débloquante. Laissé vide, aucun bouton n'est rendu.",
        },
        {
            name: 'busy',
            type: 'boolean',
            default: 'false',
            description: "Désactive le bouton et lui ajoute aria-busy pendant l'appel.",
        },
        {
            name: 'variant',
            type: "'block' | 'inline'",
            default: "'block'",
            description: 'block occupe la place du contenu absent, inline se glisse dans un flux existant.',
        },
    ];

    protected readonly outputs: ApiRow[] = [
        { name: 'action', type: 'OutputEmitterRef<void>', description: "L'utilisateur déclenche l'action débloquante." },
    ];
}
