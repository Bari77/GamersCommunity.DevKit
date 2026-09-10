import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-ui-index',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent, RouterLink],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-ui"
            heading="Composants UI"
            lead="Des primitives volontairement muettes : elles n'appellent aucun service, ne connaissent aucun modèle métier et se pilotent uniquement par leurs entrées."
        >
            <div class="gcd-cards">
                <a class="gcd-card" routerLink="/ui/breadcrumb">
                    <h3>gc-breadcrumb</h3>
                    <p>Fil d'Ariane construit à partir de l'arbre de routes actif.</p>
                </a>
                <a class="gcd-card" routerLink="/ui/skeleton">
                    <h3>gc-skeleton</h3>
                    <p>Bloc gris scintillant tenant la place d'un contenu en cours de chargement.</p>
                </a>
                <a class="gcd-card" routerLink="/ui/skeleton-text">
                    <h3>gc-skeleton-text</h3>
                    <p>Empilement de lignes de squelette imitant un paragraphe.</p>
                </a>
                <a class="gcd-card" routerLink="/ui/modal">
                    <h3>gc-modal</h3>
                    <p>Panneau centré en surimpression accueillant un contenu projeté.</p>
                </a>
                <a class="gcd-card" routerLink="/ui/decision-prompt">
                    <h3>gc-decision-prompt</h3>
                    <p>Modale de choix entre un engagement principal et la poursuite sans lui.</p>
                </a>
                <a class="gcd-card" routerLink="/ui/create-wall">
                    <h3>gc-create-wall</h3>
                    <p>Invitation à franchir l'étape qui débloque une interaction encore inaccessible.</p>
                </a>
            </div>

            <h2>Ce qu'ils ont en commun</h2>

            <ul>
                <li>tous sont <code>standalone</code> et en <code>ChangeDetectionStrategy.OnPush</code> ;</li>
                <li>
                    leurs entrées utilisent l'API <code>input()</code> à base de signaux, donc elles se lisent en
                    appelant la propriété ;
                </li>
                <li>
                    aucun n'embarque de traduction : les libellés visibles se passent en entrée, ce qui laisse
                    l'application maîtresse de son i18n ;
                </li>
                <li>aucun ne dépend de Nebular, seul <code>&#64;angular/router</code> est requis par le fil d'Ariane.</li>
            </ul>

            <h2>Import</h2>

            <p>Tout est exposé depuis la racine du package.</p>

            <gcd-code language="typescript" [code]="importSnippet" />
        </gcd-page>
    `,
})
export class UiIndexComponent {
    protected readonly importSnippet = `import {
    BreadcrumbComponent,
    CreateWallComponent,
    DecisionPromptComponent,
    ModalComponent,
    SkeletonComponent,
    SkeletonTextComponent,
} from '@bari77/gc-ui';

import type { Breadcrumb } from '@bari77/gc-ui';`;
}
