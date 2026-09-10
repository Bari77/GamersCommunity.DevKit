import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-typography-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, CodeBlockComponent],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-theme"
            heading="Typographie"
            lead="Une base minimale : la page occupe toute la hauteur, le texte courant prend la police de corps et les titres passent en police d'affichage."
        >
            <p>
                Le fichier charge <strong>Orbitron</strong> depuis Google Fonts et l'applique aux titres, tandis que
                le corps de texte reste sur une pile système. C'est ce contraste qui donne son identité à la
                plateforme sans alourdir le chargement.
            </p>

            <gcd-demo title="Échelle des titres" [html]="scaleHtml" [bare]="true">
                <div class="gcd-type">
                    <h1>Titre de niveau 1</h1>
                    <h2>Titre de niveau 2</h2>
                    <h3>Titre de niveau 3</h3>
                    <p class="gc-display">Classe gc-display sur un élément quelconque</p>
                    <p>
                        Texte courant en police de corps. Il reste lisible sur les fonds sombres grâce à la couleur
                        posée sur le body par le thème.
                    </p>
                </div>
            </gcd-demo>

            <h2>Ce que le fichier applique</h2>

            <ul>
                <li>
                    <code>html</code> et <code>body</code> passent en hauteur pleine, marge nulle, police de corps,
                    fond <code>--gc-surface-0</code> et texte <code>#edf1ff</code> ;
                </li>
                <li>
                    <code>h1</code>, <code>h2</code>, <code>h3</code> et la classe <code>.gc-display</code> prennent
                    la police d'affichage avec un interlettrage de <code>0.04em</code>.
                </li>
            </ul>

            <p>
                Rien d'autre n'est imposé : ni taille, ni graisse, ni marge. Les tailles restent celles du
                navigateur, ce qui laisse chaque application définir son échelle.
            </p>

            <h2>Appliquer la police d'affichage ailleurs</h2>

            <p>
                Pour un élément qui n'est pas un titre — un chiffre clé, un libellé de marque — la classe
                <code>.gc-display</code> évite d'avoir à réécrire la règle.
            </p>

            <gcd-code language="html" [code]="displaySnippet" />

            <div class="gcd-note">
                <p>
                    La police est chargée par un <code>&#64;import url(...)</code> vers Google Fonts. Dans un
                    contexte hors ligne ou soumis à une politique de sécurité stricte, il faut héberger Orbitron
                    localement et neutraliser cet import en n'utilisant pas <code>typography</code>.
                </p>
            </div>
        </gcd-page>
    `,
    styles: [
        `
            .gcd-type {
                width: 100%;
            }

            .gcd-type h1,
            .gcd-type h2,
            .gcd-type h3 {
                margin: 0 0 0.5rem;
            }

            .gcd-type p {
                margin: 0 0 0.75rem;
                color: #c9d4ea;
            }
        `,
    ],
})
export class TypographyPageComponent {
    protected readonly scaleHtml = `<h1>Titre de niveau 1</h1>
<h2>Titre de niveau 2</h2>
<h3>Titre de niveau 3</h3>
<p class="gc-display">Classe gc-display sur un élément quelconque</p>
<p>Texte courant en police de corps.</p>`;

    protected readonly displaySnippet = `<span class="gc-display">{{ player.itemLevel }}</span>`;
}
