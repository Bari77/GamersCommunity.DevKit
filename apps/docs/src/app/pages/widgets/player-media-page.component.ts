import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-player-media-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    templateUrl: "./player-media-page.component.html",
    styleUrl: "./player-media-page.component.scss",
})
export class PlayerMediaPageComponent {
    protected readonly managerSnippet = `<gc-player-media-manager
    [playerPublicId]="player.publicId"
    kind="photo"
    [labels]="managerLabels"
/>`;

    protected readonly adminSnippet = `<gc-player-media-admin
    [playerPublicId]="targetPublicId"
    kind="video"
    [labels]="adminLabels"
/>`;

    protected readonly labelsSnippet = `import {
  DEFAULT_PLAYER_MEDIA_MANAGER_LABELS,
  DEFAULT_PLAYER_MEDIA_ADMIN_LABELS,
  type PlayerMediaManagerLabels,
  type PlayerMediaAdminLabels,
} from '@bari77/gc-widgets';

const labels: PlayerMediaManagerLabels = {
  ...DEFAULT_PLAYER_MEDIA_MANAGER_LABELS,
  title: $localize\`:@@lol.media.manager.title:My media\`,
};`;

    protected readonly managerInputs: ApiRow[] = [
        {
            name: "playerPublicId",
            type: "string",
            default: "required",
            description: "Joueur dont on gère les médias.",
        },
        {
            name: "kind",
            type: "'photo' | 'video' | 'stream'",
            default: "required",
            description: "Famille de médias pilotée par ce manager.",
        },
        {
            name: "labels",
            type: "Partial<PlayerMediaManagerLabels>",
            default: "{}",
            description: "Surcharge i18n des libellés manager.",
        },
    ];

    protected readonly adminInputs: ApiRow[] = [
        {
            name: "playerPublicId",
            type: "string",
            default: "required",
            description: "Joueur ciblé par la curation staff.",
        },
        {
            name: "kind",
            type: "'photo' | 'video' | 'stream'",
            default: "required",
            description: "Famille de médias pilotée par cet admin.",
        },
        {
            name: "labels",
            type: "Partial<PlayerMediaAdminLabels>",
            default: "{}",
            description: "Surcharge i18n des libellés admin.",
        },
    ];
}
