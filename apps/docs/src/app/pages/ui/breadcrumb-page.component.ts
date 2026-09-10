import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreadcrumbComponent } from '@bari77/gc-ui';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-breadcrumb-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, BreadcrumbComponent],
    template: `
        <gcd-page
            lead="Fil d'Ariane qui se construit tout seul en parcourant l'arbre de routes actif, sans que la page courante ait à s'en occuper."
        >
            <p>
                Le composant lit <code>data.breadcrumb</code> sur chaque route traversée et empile un maillon pour
                celles qui en déclarent un. Il se réévalue à chaque <code>NavigationEnd</code>, et se masque
                complètement quand aucune route ne fournit de libellé — c'est ce qui le fait disparaître sur l'accueil
                sans traitement particulier.
            </p>

            <gcd-demo
                title="Démonstration vivante"
                description="Ce fil est le composant réel, alimenté par les routes de ce site."
                [html]="demoHtml"
            >
                <gc-breadcrumb rootLabel="DevKit" rootLink="/" />
            </gcd-demo>

            <h2>Déclarer les libellés</h2>

            <p>
                Les libellés sont statiques et vivent dans la définition des routes. Une route sans
                <code>breadcrumb</code> est simplement sautée : c'est ce qui permet de traverser un segment technique
                sans le montrer.
            </p>

            <gcd-code language="typescript" label="app.routes.ts" [code]="routesSnippet" />

            <p>
                Pour une application internationalisée, passez le libellé dans <code>$localize</code> comme n'importe
                quelle autre chaîne de l'application.
            </p>

            <gcd-code language="typescript" label="Avec i18n" [code]="i18nSnippet" />

            <h2>Placement</h2>

            <p>
                Montez-le une seule fois dans la coquille, au-dessus du <code>router-outlet</code>. Comme il s'efface
                de lui-même quand la route n'apporte rien, il n'y a pas besoin de le conditionner.
            </p>

            <gcd-code language="html" label="app.component.html" [code]="shellSnippet" />

            <h2>API</h2>

            <gcd-api heading="Entrées" [rows]="inputs" />

            <gcd-api heading="Type exporté" [rows]="types" [showDefault]="false" />

            <h2>Personnalisation visuelle</h2>

            <p>
                Le composant expose ses couleurs par variables CSS, avec repli sur les variables de thème Nebular
                lorsqu'elles existent. Redéfinissez-les depuis l'application pour l'accorder à votre habillage.
            </p>

            <gcd-code language="scss" [code]="cssSnippet" />

            <div class="gcd-note">
                <p>
                    Le fil est rendu dans un <code>&lt;nav&gt;</code> porteur d'un <code>aria-label</code>, et le
                    dernier maillon est un <code>&lt;span&gt;</code> marqué <code>aria-current="page"</code> plutôt
                    qu'un lien vers la page déjà affichée.
                </p>
            </div>
        </gcd-page>
    `,
})
export class BreadcrumbPageComponent {
    protected readonly demoHtml = `<gc-breadcrumb rootLabel="DevKit" rootLink="/" />`;

    protected readonly routesSnippet = `export const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    {
        path: 'world-of-warcraft',
        data: { breadcrumb: 'World of Warcraft' },
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
            name: 'rootLabel',
            type: 'string',
            default: "''",
            description:
                "Libellé du maillon racine ajouté devant le fil. Laissé vide, aucun maillon racine n'est ajouté.",
        },
        {
            name: 'rootLink',
            type: 'string',
            default: "'/'",
            description: 'Cible du maillon racine.',
        },
        {
            name: 'separator',
            type: 'string',
            default: "'/'",
            description: 'Caractère inséré entre deux maillons.',
        },
        {
            name: 'ariaLabel',
            type: 'string',
            default: "'Breadcrumb'",
            description: "Étiquette accessible portée par l'élément nav.",
        },
    ];

    protected readonly types: ApiRow[] = [
        {
            name: 'Breadcrumb',
            type: '{ label: string; url: string }',
            description: "Forme d'un maillon du fil, exportée pour les usages avancés.",
        },
    ];
}
