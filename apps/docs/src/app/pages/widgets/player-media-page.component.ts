import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-player-media-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    template: `
        <gcd-page
            lead="Administration et gestion des médias joueur (photos / vidéos) branchées sur le kernel gc-sdk."
        >
            <p>
                Deux composants complémentaires : <code>gc-player-media-admin</code> pour la curation staff, et
                <code>gc-player-media-manager</code> pour le propriétaire de la fiche. Les stores HTTP vivent dans
                <code>&#64;bari77/gc-sdk</code> (<code>PlayerMediaStore</code> / service) ; le remote ne fait
                qu’injecter le kernel et passer les libellés i18n.
            </p>

            <div class="gcd-note">
                <p>
                    Peers Nebular + <code>&#64;bari77/gc-sdk</code>. La doc se concentre sur le contrat UI ; la
                    configuration membership (<code>apiSegment</code>) est documentée côté SDK / remotes.
                </p>
            </div>

            <h2>gc-player-media-manager</h2>

            <p>Surface joueur : ajout, réordonnancement et suppression de ses propres médias.</p>

            <gcd-code language="html" [code]="managerSnippet" />

            <gcd-api heading="Entrées (manager)" [rows]="managerInputs" />

            <h2>gc-player-media-admin</h2>

            <p>Surface staff : modération / curation des médias d’un joueur ciblé.</p>

            <gcd-code language="html" [code]="adminSnippet" />

            <gcd-api heading="Entrées (admin)" [rows]="adminInputs" />

            <gcd-code language="typescript" label="Libellés" [code]="labelsSnippet" />
        </gcd-page>
    `,
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
            name: 'playerPublicId',
            type: 'string',
            default: 'required',
            description: 'Joueur dont on gère les médias.',
        },
        {
            name: 'kind',
            type: "'photo' | 'video' | 'stream'",
            default: 'required',
            description: 'Famille de médias pilotée par ce manager.',
        },
        {
            name: 'labels',
            type: 'Partial<PlayerMediaManagerLabels>',
            default: '{}',
            description: 'Surcharge i18n des libellés manager.',
        },
    ];

    protected readonly adminInputs: ApiRow[] = [
        {
            name: 'playerPublicId',
            type: 'string',
            default: 'required',
            description: 'Joueur ciblé par la curation staff.',
        },
        {
            name: 'kind',
            type: "'photo' | 'video' | 'stream'",
            default: 'required',
            description: 'Famille de médias pilotée par cet admin.',
        },
        {
            name: 'labels',
            type: 'Partial<PlayerMediaAdminLabels>',
            default: '{}',
            description: 'Surcharge i18n des libellés admin.',
        },
    ];
}
