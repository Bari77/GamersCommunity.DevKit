import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { CreateWallComponent } from "@bari77/gc-ui";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-create-wall-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, CreateWallComponent],
    templateUrl: "./create-wall-page.component.html",
    styleUrl: "./create-wall-page.component.scss",
})
export class CreateWallPageComponent {
    protected readonly busy = signal(false);

    protected readonly blockHtml = `<gc-create-wall
    heading="Aucun profil pour ce jeu"
    message="Créez votre profil pour suivre votre progression et rejoindre une équipe."
    actionLabel="Créer un profil"
    [busy]="creating()"
    (action)="createProfile()"
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

    protected readonly projectionSnippet = `<gc-create-wall heading="Équipe requise" actionLabel="Parcourir les équipes" (action)="browse()">
    <a routerLink="/help/teams">Comment fonctionnent les équipes ?</a>
</gc-create-wall>`;

    protected readonly inputs: ApiRow[] = [
        { name: "heading", type: "string", default: "''", description: "Titre de l'invitation, masqué si vide." },
        { name: "message", type: "string", default: "''", description: "Phrase explicative, masquée si vide." },
        {
            name: "actionLabel",
            type: "string",
            default: "''",
            description: "Libellé de l'action débloquante. Laissé vide, aucun bouton n'est rendu.",
        },
        {
            name: "busy",
            type: "boolean",
            default: "false",
            description: "Désactive le bouton et lui ajoute aria-busy pendant l'appel.",
        },
        {
            name: "variant",
            type: "'block' | 'inline'",
            default: "'block'",
            description: "block occupe la place du contenu absent, inline se glisse dans un flux existant.",
        },
    ];

    protected readonly outputs: ApiRow[] = [
        {
            name: "action",
            type: "OutputEmitterRef<void>",
            description: "L'utilisateur déclenche l'action débloquante.",
        },
    ];

    protected run(): void {
        this.busy.set(true);
        setTimeout(() => this.busy.set(false), 1600);
    }
}
