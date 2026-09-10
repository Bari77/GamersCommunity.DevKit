import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonComponent } from '@bari77/gc-ui';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-skeleton-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, SkeletonComponent],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-ui"
            heading="Skeleton"
            selector="gc-skeleton"
            lead="Bloc scintillant qui occupe la place d'un contenu encore en cours de chargement, pour éviter que la page ne saute quand la donnée arrive."
            [importSnippet]="importSnippet"
        >
            <p>
                Le composant ne fait que dessiner une forme : c'est à l'appelant de lui donner les dimensions du
                contenu qu'il remplace. Bien dimensionné, il supprime le décalage de mise en page au moment où la
                donnée s'affiche.
            </p>

            <gcd-demo title="Dimensions libres" [html]="basicHtml">
                <gc-skeleton width="18rem" height="1.25rem" />
                <gc-skeleton width="12rem" height="1.25rem" />
                <gc-skeleton width="18rem" height="6rem" radius="0.6rem" />
            </gcd-demo>

            <gcd-demo title="Forme ronde" description="Pour un avatar, la forme circle ignore le rayon." [html]="circleHtml">
                <gc-skeleton shape="circle" width="4rem" height="4rem" />
            </gcd-demo>

            <h2>Usage courant</h2>

            <p>
                Le cas le plus fréquent est de brancher l'affichage sur l'état de chargement d'une ressource, en
                gardant exactement la même structure de part et d'autre de la condition.
            </p>

            <gcd-code language="html" [code]="usageSnippet" />

            <h2>API</h2>

            <gcd-api heading="Entrées" [rows]="inputs" />

            <div class="gcd-note">
                <p>
                    Le composant porte <code>aria-hidden="true"</code> : il est invisible pour les lecteurs d'écran,
                    qui n'ont rien à annoncer tant que la donnée n'est pas là. Si l'attente doit être signalée,
                    ajoutez une région <code>aria-live</code> à côté.
                </p>
            </div>
        </gcd-page>
    `,
})
export class SkeletonPageComponent {
    protected readonly importSnippet = `import { SkeletonComponent } from '@bari77/gc-ui';`;

    protected readonly basicHtml = `<gc-skeleton width="18rem" height="1.25rem" />
<gc-skeleton width="12rem" height="1.25rem" />
<gc-skeleton width="18rem" height="6rem" radius="0.6rem" />`;

    protected readonly circleHtml = `<gc-skeleton shape="circle" width="4rem" height="4rem" />`;

    protected readonly usageSnippet = `@if (players.isPending()) {
    <gc-skeleton width="100%" height="3rem" radius="0.5rem" />
} @else {
    <app-player-row [player]="players.value()" />
}`;

    protected readonly inputs: ApiRow[] = [
        {
            name: 'width',
            type: 'string',
            default: "'100%'",
            description: 'Largeur appliquée telle quelle en CSS.',
        },
        {
            name: 'height',
            type: 'string',
            default: "'1rem'",
            description: 'Hauteur appliquée telle quelle en CSS.',
        },
        {
            name: 'radius',
            type: 'string',
            default: "'0.25rem'",
            description: "Rayon des coins. Ignoré lorsque shape vaut circle.",
        },
        {
            name: 'shape',
            type: "'rect' | 'circle'",
            default: "'rect'",
            description: 'La forme circle force un rayon de 50 %, pour un avatar ou une pastille.',
        },
    ];
}
