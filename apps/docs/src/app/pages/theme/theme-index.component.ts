import { ChangeDetectionStrategy, Component } from '@angular/core';
import { pageCards } from '../../docs.config';
import { CardGridComponent } from '../../shared/card-grid.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';
import { themePartialsSnippet, themeStylesSnippet } from '../../shared/snippets';

@Component({
    selector: 'gcd-theme-index',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent, CardGridComponent],
    template: `
        <gcd-page
            lead="Du SCSS pur, sans aucune dépendance : des tokens en variables CSS, une base typographique, des animations et quelques utilitaires."
        >
            <gcd-card-grid [cards]="cards" />

            <h2>Importer le thème</h2>

            <p>
                <code>global.scss</code> charge l'ensemble : tokens, typographie, habillage de la coquille,
                animations, barres de défilement et utilitaires. Dans une application Angular, il se déclare dans le
                tableau <code>styles</code> de <code>angular.json</code>, avant votre feuille globale.
            </p>

            <gcd-code language="json" label="angular.json" [code]="globalSnippet" />

            <p>
                Chaque partie est aussi exposée séparément par le champ <code>exports</code> du package, pour les cas
                où l'on ne veut qu'un morceau — par exemple les tokens dans une feuille isolée. Le chemin de fichier
                fonctionne depuis une feuille SCSS.
            </p>

            <gcd-code language="scss" label="Import ciblé" [code]="partialSnippet" />

            <div class="gcd-note">
                <p>
                    Le fichier <code>_shell.scss</code> vise des sélecteurs Nebular
                    (<code>nb-layout-header</code>, <code>nb-layout-footer</code>). Dans une application sans
                    Nebular, ces règles sont simplement inertes : l'import global reste sans effet de bord.
                </p>
            </div>

            <h2>Ce que le thème n'est pas</h2>

            <p>
                Ce n'est pas un thème Nebular. Il ne déclare aucun <code>NbThemeModule</code> et ne remplace pas le
                thème <code>cosmic</code> utilisé par la coquille : il pose une couche de tokens par-dessus, que les
                composants du DevKit et ceux de l'application consomment.
            </p>
        </gcd-page>
    `,
})
export class ThemeIndexComponent {
    protected readonly cards = pageCards('theme');

    protected readonly globalSnippet = themeStylesSnippet();

    protected readonly partialSnippet = themePartialsSnippet(['tokens', 'typography', 'motion']);
}
