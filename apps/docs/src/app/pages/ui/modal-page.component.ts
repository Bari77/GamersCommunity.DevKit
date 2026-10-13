import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ModalComponent } from "@bari77/gc-ui";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-modal-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, ModalComponent],
    templateUrl: "./modal-page.component.html",
    styleUrl: "./modal-page.component.scss",
})
export class ModalPageComponent {
    protected readonly open = signal(false);
    protected readonly blocking = signal(false);

    protected readonly basicHtml = `<button type="button" (click)="open.set(true)">Ouvrir la modale</button>

<gc-modal [open]="open()" ariaLabel="Rejoindre l'équipe" (dismissed)="open.set(false)">
    <h2>Rejoindre l'équipe</h2>
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
            name: "open",
            type: "boolean",
            default: "false",
            description: "Pilote l'affichage. Rien n'est rendu tant qu'il vaut false.",
        },
        {
            name: "ariaLabel",
            type: "string",
            default: "''",
            description: "Étiquette accessible du panneau.",
        },
        {
            name: "dismissible",
            type: "boolean",
            default: "true",
            description: "À false, le fond et la touche Échap cessent de demander la fermeture.",
        },
    ];

    protected readonly outputs: ApiRow[] = [
        {
            name: "dismissed",
            type: "OutputEmitterRef<'backdrop' | 'escape'>",
            description:
                "Demande de fermeture émise par le fond ou par la touche Échap. La fermeture effective reste à la charge de l'appelant.",
        },
    ];
}
