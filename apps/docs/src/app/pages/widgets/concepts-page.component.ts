import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-concepts-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent, RouterLink],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-widgets"
            heading="Concepts"
            lead="Le tableau de bord personnalisable : une pile de pages, chacune portant des widgets placés sur une grille, décrits par un catalogue et rendus par des gabarits fournis par l'application."
        >
            <h2>Le modèle de données</h2>

            <p>
                Tout tient dans trois structures imbriquées. Elles sont sérialisables telles quelles, ce qui permet
                de stocker l'ensemble dans une seule colonne côté serveur.
            </p>

            <gcd-code language="typescript" [code]="modelSnippet" />

            <ul>
                <li>
                    un <strong>workspace</strong> porte un numéro de version et la liste ordonnée de ses pages ;
                </li>
                <li>
                    une <strong>page</strong> a un titre, éventuellement une icône, et peut être
                    <code>locked</code> — auquel cas le propriétaire ne peut ni la renommer ni la supprimer ;
                </li>
                <li>
                    une <strong>instance</strong> place un widget d'un certain <code>type</code> à une position et
                    une taille données, avec ses propres réglages. Un même type peut être placé plusieurs fois.
                </li>
            </ul>

            <h2>Qui fournit quoi</h2>

            <p>
                Le package ne connaît aucun widget en particulier. Il orchestre trois apports de l'application
                hôte :
            </p>

            <ul>
                <li>
                    le <a routerLink="/widgets/catalog">catalogue</a>, qui déclare les types disponibles, leur taille
                    par défaut et les champs de réglage à proposer ;
                </li>
                <li>
                    un <strong>gabarit de rendu</strong> par type, déclaré avec la directive <code>gcWidget</code> ;
                </li>
                <li>la <a routerLink="/widgets/persistence">persistance</a>, entièrement à la charge de l'appelant.</li>
            </ul>

            <gcd-code language="html" label="Déclarer le rendu d'un type" [code]="defSnippet" />

            <p>
                Le gabarit reçoit les réglages de l'instance en <code>$implicit</code> et l'instance complète dans la
                variable <code>instance</code>. La grille l'instancie une fois par widget placé, donc l'ordre des
                gabarits dans l'hôte n'a aucune importance.
            </p>

            <h2>Brouillon et enregistrement</h2>

            <p>
                C'est le point le plus important à comprendre avant d'intégrer. Les modifications ne touchent jamais
                directement le workspace passé en entrée : elles s'accumulent dans un <strong>brouillon</strong>
                interne, et <code>save</code> émet le résultat quand le propriétaire valide.
            </p>

            <p>
                L'appelant persiste, puis republie le workspace committé. Si l'enregistrement échoue, il suffit de ne
                rien republier : le mode édition reste actif avec les modifications intactes.
            </p>

            <div class="gcd-note">
                <p>
                    Ne rebranchez jamais la valeur émise par <code>save</code> sur l'entrée
                    <code>workspace</code> avant qu'elle ne soit réellement persistée. Le composant s'en sert pour
                    distinguer ce qui est validé de ce qui ne l'est pas encore.
                </p>
            </div>

            <h2>Deux façons de modifier</h2>

            <p>
                Le <strong>mode édition</strong>, ouvert par la barre d'édition, autorise le déplacement, le
                redimensionnement, l'ajout et la suppression, et se conclut par un enregistrement explicite.
            </p>

            <p>
                La <strong>roue crantée</strong> d'un widget reste accessible hors mode édition pour ajuster ses
                réglages. Dans ce cas, la fermeture du panneau enregistre toute seule, et uniquement si quelque
                chose a réellement changé.
            </p>

            <h2>Aller plus loin</h2>

            <div class="gcd-cards">
                <a class="gcd-card" routerLink="/widgets/workspace">
                    <h3>Workspace</h3>
                    <p>Le composant assemblé, sa démonstration et ses entrées.</p>
                </a>
                <a class="gcd-card" routerLink="/widgets/catalog">
                    <h3>Catalogue</h3>
                    <p>Déclarer les types disponibles et leurs champs de réglage.</p>
                </a>
                <a class="gcd-card" routerLink="/widgets/built-in">
                    <h3>Widgets fournis</h3>
                    <p>Liste de liens, galerie et lecteur Twitch prêts à brancher.</p>
                </a>
                <a class="gcd-card" routerLink="/widgets/persistence">
                    <h3>Persistance</h3>
                    <p>Lire, écrire et réparer un workspace stocké.</p>
                </a>
            </div>
        </gcd-page>
    `,
})
export class ConceptsPageComponent {
    protected readonly modelSnippet = `interface WidgetWorkspace {
    version: number;
    pages: WidgetPage[];
}

interface WidgetPage {
    id: string;
    title: string;
    icon?: string;
    /** Une page verrouillée ne peut être ni renommée ni supprimée. */
    locked?: boolean;
    widgets: WidgetInstance[];
}

interface WidgetInstance {
    id: string;
    type: string;
    x: number;
    y: number;
    cols: number;
    rows: number;
    settings: Record<string, unknown>;
}`;

    protected readonly defSnippet = `<gc-widget-workspace [workspace]="workspace()" [catalog]="catalog">
    <ng-template gcWidget="links" let-settings let-instance="instance">
        <gc-link-list [links]="asLinks(settings['links'])" />
    </ng-template>
</gc-widget-workspace>`;
}
