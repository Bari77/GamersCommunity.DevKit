import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-entity-wall-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    templateUrl: "./entity-wall-page.component.html",
    styleUrl: "./entity-wall-page.component.scss",
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
        { name: "posts", type: "EntityWallPost[]", default: "required", description: "Posts visibles." },
        { name: "pending", type: "EntityWallPost[]", default: "[]", description: "File de modération." },
        { name: "canPublish", type: "boolean", default: "false", description: "Affiche le composer." },
        { name: "canModerate", type: "boolean", default: "false", description: "Actions approve/reject/delete." },
        { name: "playerPublicId", type: "string | null", default: "null", description: "Pour isMine / édition." },
        { name: "loading", type: "boolean", default: "false", description: "Squelette du fil." },
        { name: "loadingPending", type: "boolean", default: "false", description: "Squelette de la file." },
        { name: "loadingMore", type: "boolean", default: "false", description: "Bouton « load more » busy." },
        { name: "hasMore", type: "boolean", default: "false", description: "Affiche le chargement page suivante." },
        { name: "posting", type: "boolean", default: "false", description: "État d’envoi côté UI." },
        { name: "queuedNotice", type: "boolean", default: "false", description: "Bandeau « en attente de review »." },
        {
            name: "labels",
            type: "Partial<EntityWallLabels>",
            default: "{}",
            description: "Surcharge des libellés (titre, empty, edit…).",
        },
    ];

    protected readonly outputs: ApiRow[] = [
        { name: "loadMoreClick", type: "void", description: "Demande la page suivante." },
        {
            name: "moderateClick",
            type: "{ post; approve: boolean }",
            description: "Approuver ou rejeter un post en file.",
        },
        { name: "removeClick", type: "EntityWallPost", description: "Suppression d’un post." },
        { name: "editStart", type: "EntityWallPost", description: "Entrée en mode édition." },
    ];
}
