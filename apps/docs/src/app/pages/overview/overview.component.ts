import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ANGULAR_RANGE, packageCards } from '../../docs.config';
import { CardGridComponent } from '../../shared/card-grid.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';
import { lockstepSnippet } from '../../shared/snippets';

@Component({
    selector: 'gcd-overview',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent, CardGridComponent, RouterLink],
    template: `
        <gcd-page
            lead="Les briques partagées par la coquille Platform et par les modules de jeu : primitives d'interface, thème et tableau de bord de widgets."
        >
            <gcd-card-grid [cards]="cards" />

            <h2>Ce qu'il faut savoir avant d'intégrer</h2>

            <p>
                Les packages publient du <strong>TypeScript source</strong>, pas un bundle compilé. Leur
                <code>package.json</code> pointe <code>main</code> et <code>types</code> vers
                <code>./src/index.ts</code>, et c'est l'application consommatrice qui les compile avec son propre
                compilateur Angular.
            </p>

            <p>Trois conséquences pratiques :</p>

            <ul>
                <li>
                    la version d'Angular de l'application doit satisfaire les <code>peerDependencies</code> des
                    packages, aujourd'hui <code>{{ angularRange }}</code> ;
                </li>
                <li>
                    les options strictes du <code>tsconfig</code> de l'application s'appliquent aussi au code des
                    packages, qui est écrit en <code>strict</code> ;
                </li>
                <li>
                    une seule copie d'Angular doit exister dans l'arbre de dépendances, sinon l'injection échoue à
                    l'exécution.
                </li>
            </ul>

            <h2>Versionnage</h2>

            <p>
                Tous les packages <code>&#64;bari77/*</code> avancent en <strong>lockstep</strong> : une publication
                pousse la même version pour l'ensemble, même si un seul package a changé. Il faut donc les monter
                ensemble côté consommateur.
            </p>

            <gcd-code language="json" label="package.json de l'application" [code]="lockstepSnippet" />

            <h2>Où ces packages sont consommés</h2>

            <p>
                La coquille <code>Platform.Front</code> et chaque module de jeu (<code>WorldOfWarcraft.Front</code>,
                <code>Template.Front</code>) dépendent des mêmes versions. Les modules de jeu sont chargés par Native
                Federation dans la coquille : un composant partagé ne doit donc jamais supposer qu'il tourne dans un
                contexte particulier, ni instancier un thème global.
            </p>

            <p>
                Le détail de l'installation, y compris l'authentification GitHub Packages, est sur la page
                <a routerLink="/installation">Installation</a>.
            </p>
        </gcd-page>
    `,
})
export class OverviewComponent {
    protected readonly cards = packageCards;

    protected readonly angularRange = ANGULAR_RANGE;

    protected readonly lockstepSnippet = lockstepSnippet();
}
