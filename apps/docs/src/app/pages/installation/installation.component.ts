import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GRIDSTER_RANGE, PACKAGES } from '../../docs.config';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';
import { installSnippet, themeStylesSnippet } from '../../shared/snippets';

@Component({
    selector: 'gcd-installation',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent],
    template: `
        <gcd-page
            lead="Les packages sont publiés sur GitHub Packages en accès restreint : le registre doit être déclaré et authentifié avant le premier install."
        >
            <h2>1. Déclarer le registre</h2>

            <p>
                Ajoutez un <code>.npmrc</code> à la racine du projet consommateur. Le jeton doit porter la portée
                <code>read:packages</code>.
            </p>

            <gcd-code language="bash" label=".npmrc" [code]="npmrcSnippet" />

            <div class="gcd-note">
                <p>
                    Ne commitez jamais le jeton. En local, laissez la ligne <code>_authToken</code> en commentaire et
                    exportez <code>NODE_AUTH_TOKEN</code> ; en CI, <code>actions/setup-node</code> écrit la ligne pour
                    vous à partir du secret.
                </p>
            </div>

            <h2>2. Installer les packages</h2>

            <gcd-code language="bash" [code]="installSnippet" />

            <p>
                Le trio avance en lockstep : installez la même version pour les trois, même si vous n'utilisez qu'un
                seul d'entre eux aujourd'hui.
            </p>

            <h2>3. Importer le thème</h2>

            <p>
                Le thème est du SCSS pur. Déclarez-le une seule fois dans le tableau <code>styles</code> de
                <code>angular.json</code>, avant votre propre feuille globale pour pouvoir le surcharger.
            </p>

            <gcd-code language="json" label="angular.json" [code]="themeSnippet" />

            <h2>4. Utiliser un composant</h2>

            <p>
                Tous les composants sont <code>standalone</code> : il suffit de les ajouter au tableau
                <code>imports</code> du composant hôte, sans module intermédiaire.
            </p>

            <gcd-code language="typescript" label="app.component.ts" [code]="usageSnippet" />

            <h2>Cas particulier des widgets</h2>

            <p>
                <code>{{ packages.widgets }}</code> s'appuie sur <code>angular-gridster2</code>, déclaré en
                <code>peerDependency</code>. Il faut donc l'installer explicitement dans l'application, faute de quoi
                la grille ne se résoudra pas au build.
            </p>

            <gcd-code language="bash" [code]="gridsterSnippet" />
        </gcd-page>
    `,
})
export class InstallationComponent {
    protected readonly packages = PACKAGES;

    protected readonly npmrcSnippet = `${PACKAGES.ui.split('/')[0]}:registry=https://npm.pkg.github.com
# //npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT`;

    protected readonly installSnippet = installSnippet();

    protected readonly themeSnippet = themeStylesSnippet(['node_modules/@nebular/theme/styles/prebuilt/cosmic.css']);

    protected readonly usageSnippet = `import { Component } from '@angular/core';
import { SkeletonTextComponent } from '${PACKAGES.ui}';

@Component({
    selector: 'app-player-card',
    standalone: true,
    imports: [SkeletonTextComponent],
    template: \`
        @if (loading()) {
            <gc-skeleton-text [lines]="3" />
        } @else {
            <p>{{ player().biography }}</p>
        }
    \`,
})
export class PlayerCardComponent {}`;

    protected readonly gridsterSnippet = `npm install "angular-gridster2@${GRIDSTER_RANGE}"`;
}
