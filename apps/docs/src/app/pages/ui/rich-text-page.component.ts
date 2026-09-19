import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RichContentComponent,
    RichEditorComponent,
    isRichHtmlBlank,
    stripRichHtmlPlainText,
} from '@bari77/gc-ui';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

/** Exercises every mark and node the toolbar can produce, plus the headings the schema allows. */
const SAMPLE_HTML = [
    '<h3>Qui je suis</h3>',
    '<p><strong>Joueuse du soir</strong>, <em>développeuse le jour</em>,',
    ' et <u>toujours</u> en <s>retard</s> avance d’une mise à jour.</p>',
    '<p>Je joue surtout en <span style="color: #00d68f">coopératif</span>,',
    ' parfois en <span style="color: #ffaa00">compétitif</span>,',
    ' rarement avant <span style="color: #ff3d71">20 h</span>.</p>',
    '<p>Mes disponibilités sont à jour sur',
    ' <a href="https://example.com/players/nova" target="_blank" rel="noopener noreferrer">ma fiche de joueur</a>.</p>',
    '<h3>Ce que je cherche</h3>',
    '<ul><li>Une équipe stable, deux soirs par semaine</li><li>Micro branché et ambiance détendue</li></ul>',
    '<p>Mes objectifs de la saison :</p>',
    '<ol><li>Terminer la campagne en difficulté maximale</li><li>Entrer dans le classement par équipe</li>',
    '<li><span style="color: #a855f7">Organiser un tournoi interne</span></li></ol>',
].join('');

@Component({
    selector: 'gcd-rich-text-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PageComponent,
        DemoComponent,
        ApiTableComponent,
        CodeBlockComponent,
        RichEditorComponent,
        RichContentComponent,
    ],
    styles: `
        .gcd-widget-shell {
            width: 100%;
            max-width: 32rem;
            padding: 0.85rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            background: var(--gc-surface-2);
        }

        .gcd-widget-shell__label {
            margin: 0 0 0.5rem;
            font-family: var(--gc-font-display);
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            opacity: 0.7;
        }
    `,
    template: `
        <gcd-page
            lead="Édition et affichage HTML assaini pour les présentations, les murs de messages et les autres champs libres. Le HTML est toujours repassé côté API par le sanitizer du Core avant stockage."
        >
            <p>
                <code>gc-rich-editor</code> s'appuie sur TipTap et limite la longueur en <strong>texte brut</strong>
                lorsque <code>maxLength</code> est renseigné. <code>gc-rich-content</code> affiche le HTML via
                DOMPurify avec une liste blanche alignée sur le serveur.
            </p>

            <p>
                La barre d'outils couvre le gras, l'italique, le souligné, les titres <code>h2</code>/<code>h3</code>,
                les listes à puces et numérotées, le lien et six couleurs de texte. Le barré fait aussi partie du
                schéma : il s'obtient au clavier (<code>~~barré~~</code>) ou par collage, et survit à
                l'assainissement.
            </p>

            <div class="gcd-note">
                <p>
                    Un module de jeu qui consomme <code>&#64;bari77/gc-ui</code> via la fédération doit aussi
                    déclarer les paquets <code>&#64;tiptap/*</code> et <code>dompurify</code> dans son
                    <code>package.json</code> : ils ne sont pas partagés par la coquille.
                </p>
            </div>

            <h2>gc-rich-editor</h2>

            <gcd-demo
                title="Éditeur complet"
                description="Gras, italique, souligné, barré, couleurs, lien, listes et titres : le contenu ci-dessous est éditable."
                [html]="fullEditorHtml"
                [bare]="true"
            >
                <div class="gcd-widget-shell">
                    <p class="gcd-widget-shell__label">Présentation</p>
                    <gc-rich-editor
                        [value]="fullDraft()"
                        (valueChange)="fullDraft.set($event)"
                        [maxLength]="4000"
                        placeholder="Décrivez-vous en quelques lignes…"
                    />
                </div>
            </gcd-demo>

            <gcd-demo
                title="Mode compact"
                description="Catchphrase ou accroche : barre d'outils réduite."
                [html]="compactEditorHtml"
                [bare]="true"
            >
                <gc-rich-editor
                    [compact]="true"
                    [value]="compactDraft()"
                    (valueChange)="compactDraft.set($event)"
                    [maxLength]="120"
                    placeholder="Phrase d'accroche"
                />
            </gcd-demo>

            <p>Le HTML produit par l'éditeur complet, tel qu'il partirait vers l'API :</p>

            <gcd-code language="html" label="HTML produit" [code]="prettyHtml()" />

            <gcd-api heading="Entrées (gc-rich-editor)" [rows]="editorInputs" />

            <h2>gc-rich-content</h2>

            <gcd-demo title="Rendu HTML" [html]="contentHtml" [bare]="true">
                <gc-rich-content [html]="previewHtml()" />
            </gcd-demo>

            <gcd-api heading="Entrées (gc-rich-content)" [rows]="contentInputs" />

            <h2>Utilitaires</h2>

            <gcd-code language="typescript" [code]="utilsSnippet" />

            <p>
                Vide côté éditeur : <code>{{ blankLabel() }}</code> — texte brut extrait :
                <code>{{ plainPreview() }}</code>
            </p>
        </gcd-page>
    `,
})
export class RichTextPageComponent {
    protected readonly fullDraft = signal(SAMPLE_HTML);
    protected readonly compactDraft = signal(
        '<p><strong>Toujours partant</strong> pour une <em>dernière partie</em>, <span style="color: #3366ff">même à 2 h du matin</span>.</p>',
    );

    protected readonly previewHtml = () => this.fullDraft();

    protected blankLabel(): string {
        return isRichHtmlBlank(this.fullDraft()) ? 'oui' : 'non';
    }

    protected plainPreview(): string {
        const text = stripRichHtmlPlainText(this.fullDraft());
        return text.length > 48 ? `${text.slice(0, 48)}…` : text;
    }

    /** TipTap serialises everything on one line, unreadable in a code block. */
    protected prettyHtml(): string {
        return this.fullDraft().replace(/(<\/(?:p|h2|h3|ul|ol|li)>)(?=<)/g, '$1\n');
    }

    protected readonly fullEditorHtml = `<gc-rich-editor
    [(value)]="presentation"
    [maxLength]="4000"
    placeholder="Décrivez-vous en quelques lignes…"
/>`;

    protected readonly compactEditorHtml = `<gc-rich-editor
    [compact]="true"
    [(value)]="catchphrase"
    [maxLength]="120"
    placeholder="Phrase d'accroche"
/>`;

    protected readonly contentHtml = `<gc-rich-content [html]="presentation" />`;

    protected readonly utilsSnippet = `import { isRichHtmlBlank, stripRichHtmlPlainText } from '@bari77/gc-ui';

if (isRichHtmlBlank(draft)) {
    // traiter comme vide
}

const plain = stripRichHtmlPlainText(storedHtml);`;

    protected readonly editorInputs: ApiRow[] = [
        { name: 'value', type: 'string', default: "''", description: 'HTML courant (modèle bidirectionnel).' },
        {
            name: 'compact',
            type: 'boolean',
            default: 'false',
            description: 'Barre d’outils réduite (sans titres, listes ni lien) pour les champs courts.',
        },
        { name: 'placeholder', type: 'string', default: "''", description: 'Texte fantôme TipTap.' },
        {
            name: 'maxLength',
            type: 'number | null',
            default: 'null',
            description: 'Limite en caractères de texte brut ; affiche le compteur.',
        },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Désactive la saisie.' },
    ];

    protected readonly contentInputs: ApiRow[] = [
        { name: 'html', type: 'string', default: "''", description: 'HTML à afficher après assainissement client.' },
    ];
}
