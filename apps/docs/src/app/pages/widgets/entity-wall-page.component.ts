import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-entity-wall-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    template: `
        <gcd-page
            lead="Mur d'entité (équipe / guilde) : fil de posts, file de modération, composer et actions staff."
        >
            <p>
                Le shell présente les posts et la file d'attente ; le remote garde les stores HTTP, la validation et
                le formulaire métier. Les libellés passent par <code>labels</code> (i18n côté remote).
            </p>

            <div class="gcd-note">
                <p>
                    Peer Nebular (<code>NbButtonModule</code>, <code>NbCardModule</code>). La démo interactive n'est
                    pas embarquée ici : branchez-le dans un remote qui fournit déjà le thème.
                </p>
            </div>

            <h2>Slots</h2>

            <ul>
                <li>
                    <code>gcEntityWallComposer</code> — formulaire de publication projeté en haut du mur ;
                </li>
                <li>
                    <code>ng-template gcEntityWallEdit</code> — édition d'un post (<code>$implicit</code> = post) ;
                </li>
                <li>
                    <code>ng-template gcEntityWallExtras</code> — contenu sous le corps (média, audience…).
                </li>
            </ul>

            <gcd-code language="html" [code]="usageSnippet" />

            <h2>API</h2>

            <gcd-api heading="Entrées" [rows]="inputs" />
            <gcd-api heading="Sorties" [rows]="outputs" [showDefault]="false" />

            <gcd-code language="typescript" label="Type EntityWallPost" [code]="postTypeSnippet" />
        </gcd-page>
    `,
})
export class EntityWallPageComponent {
    protected readonly usageSnippet = `<gc-entity-wall
    [posts]="store.posts()"
    [pending]="store.pending()"
    [canPublish]="canPublish()"
    [canModerate]="canModerate()"
    [playerPublicId]="playerPublicId()"
    [loading]="store.loading()"
    [labels]="labels"
    (loadMoreClick)="store.loadMore()"
    (moderateClick)="moderate($event)"
    (removeClick)="remove($event)"
>
    <app-post-form gcEntityWallComposer (save)="publish($event)" />
    <ng-template gcEntityWallEdit let-post>
        <app-post-form [post]="post" (save)="saveEdit(post, $event)" />
    </ng-template>
</gc-entity-wall>`;

    protected readonly postTypeSnippet = `export interface EntityWallPost {
  publicId: string;
  body: string;
  creationDate: Date;
  authorPlatformUserPublicId: string | null;
  authorHandleLabel(): string;
  isContactable(): boolean;
  isMine(playerPublicId: string | null | undefined): boolean;
}`;

    protected readonly inputs: ApiRow[] = [
        { name: 'posts', type: 'EntityWallPost[]', default: 'required', description: 'Posts visibles.' },
        { name: 'pending', type: 'EntityWallPost[]', default: '[]', description: 'File de modération.' },
        { name: 'canPublish', type: 'boolean', default: 'false', description: 'Affiche le composer.' },
        { name: 'canModerate', type: 'boolean', default: 'false', description: 'Actions approve/reject/delete.' },
        { name: 'playerPublicId', type: 'string | null', default: 'null', description: 'Pour isMine / édition.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Squelette du fil.' },
        { name: 'loadingPending', type: 'boolean', default: 'false', description: 'Squelette de la file.' },
        { name: 'loadingMore', type: 'boolean', default: 'false', description: 'Bouton « load more » busy.' },
        { name: 'hasMore', type: 'boolean', default: 'false', description: 'Affiche le chargement page suivante.' },
        { name: 'posting', type: 'boolean', default: 'false', description: 'État d’envoi côté UI.' },
        { name: 'queuedNotice', type: 'boolean', default: 'false', description: 'Bandeau « en attente de review ».' },
        {
            name: 'labels',
            type: 'Partial<EntityWallLabels>',
            default: '{}',
            description: 'Surcharge des libellés (titre, empty, edit…).',
        },
    ];

    protected readonly outputs: ApiRow[] = [
        { name: 'loadMoreClick', type: 'void', description: 'Demande la page suivante.' },
        {
            name: 'moderateClick',
            type: '{ post; approve: boolean }',
            description: 'Approuver ou rejeter un post en file.',
        },
        { name: 'removeClick', type: 'EntityWallPost', description: 'Suppression d’un post.' },
        { name: 'editStart', type: 'EntityWallPost', description: 'Entrée en mode édition.' },
    ];
}
