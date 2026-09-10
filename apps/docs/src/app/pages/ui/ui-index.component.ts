import { ChangeDetectionStrategy, Component } from '@angular/core';
import { pageCards } from '../../docs.config';
import { CardGridComponent } from '../../shared/card-grid.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';
import { sectionImportSnippet } from '../../shared/snippets';

@Component({
    selector: 'gcd-ui-index',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent, CardGridComponent],
    template: `
        <gcd-page
            lead="Des primitives volontairement muettes : elles n'appellent aucun service, ne connaissent aucun modèle métier et se pilotent uniquement par leurs entrées."
        >
            <gcd-card-grid [cards]="cards" />

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
    protected readonly cards = pageCards('ui');

    protected readonly importSnippet = sectionImportSnippet('ui');
}
