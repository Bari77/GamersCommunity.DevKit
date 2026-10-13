import { ChangeDetectionStrategy, Component } from "@angular/core";
import { BreadcrumbComponent } from "@bari77/gc-ui";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-breadcrumb-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, BreadcrumbComponent],
    templateUrl: "./breadcrumb-page.component.html",
    styleUrl: "./breadcrumb-page.component.scss",
})
export class BreadcrumbPageComponent {
    protected readonly demoHtml = `<gc-breadcrumb rootLabel="DevKit" rootLink="/" />`;

    protected readonly routesSnippet = `export const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    {
        path: 'games/:slug',
        data: { breadcrumb: 'Jeu' },
        children: [
            {
                path: 'players/:publicId',
                data: { breadcrumb: 'Joueur' },
                loadComponent: () => import('./player-sheet.component').then((m) => m.PlayerSheetComponent),
            },
        ],
    },
];`;

    protected readonly i18nSnippet = `{
    path: 'events',
    data: { breadcrumb: $localize\`:@@core.breadcrumb.events:Events\` },
    loadChildren: () => import('./events.routes').then((r) => r.eventsRoutes),
}`;

    protected readonly shellSnippet = `<nb-layout-column>
    <gc-breadcrumb [rootLabel]="homeLabel" rootLink="/home" />
    <router-outlet />
</nb-layout-column>`;

    protected readonly cssSnippet = `gc-breadcrumb {
    --gc-breadcrumb-padding: 1rem 0 0.5rem;
    --gc-breadcrumb-link-color: #8f9bb3;
    --gc-breadcrumb-link-hover-color: #3366ff;
    --gc-breadcrumb-separator-color: #8f9bb3;
    --gc-breadcrumb-current-color: #ffffff;
}`;

    protected readonly inputs: ApiRow[] = [
        {
            name: "rootLabel",
            type: "string",
            default: "''",
            description:
                "Libellé du maillon racine ajouté devant le fil. Laissé vide, aucun maillon racine n'est ajouté.",
        },
        {
            name: "rootLink",
            type: "string",
            default: "'/'",
            description: "Cible du maillon racine.",
        },
        {
            name: "separator",
            type: "string",
            default: "'/'",
            description: "Caractère inséré entre deux maillons.",
        },
        {
            name: "ariaLabel",
            type: "string",
            default: "'Breadcrumb'",
            description: "Étiquette accessible portée par l'élément nav.",
        },
    ];

    protected readonly types: ApiRow[] = [
        {
            name: "Breadcrumb",
            type: "{ label: string; url: string }",
            description: "Forme d'un maillon du fil, exportée pour les usages avancés.",
        },
    ];
}
