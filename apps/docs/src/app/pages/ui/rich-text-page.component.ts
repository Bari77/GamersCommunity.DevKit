import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { RichContentComponent, RichEditorComponent, isRichHtmlBlank, stripRichHtmlPlainText } from "@bari77/gc-ui";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

/** Exercises every mark and node the toolbar can produce, plus the headings the schema allows. */
const SAMPLE_HTML = [
    "<h3>Qui je suis</h3>",
    "<p><strong>Joueuse du soir</strong>, <em>développeuse le jour</em>,",
    " et <u>toujours</u> en <s>retard</s> avance d’une mise à jour.</p>",
    '<p>Je joue surtout en <span style="color: #00d68f">coopératif</span>,',
    ' parfois en <span style="color: #ffaa00">compétitif</span>,',
    ' rarement avant <span style="color: #ff3d71">20 h</span>.</p>',
    "<p>Mes disponibilités sont à jour sur",
    ' <a href="https://example.com/players/nova" target="_blank" rel="noopener noreferrer">ma fiche de joueur</a>.</p>',
    "<h3>Ce que je cherche</h3>",
    "<ul><li>Une équipe stable, deux soirs par semaine</li><li>Micro branché et ambiance détendue</li></ul>",
    "<p>Mes objectifs de la saison :</p>",
    "<ol><li>Terminer la campagne en difficulté maximale</li><li>Entrer dans le classement par équipe</li>",
    '<li><span style="color: #a855f7">Organiser un tournoi interne</span></li></ol>',
].join("");

@Component({
    selector: "gcd-rich-text-page",
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
    styleUrl: "./rich-text-page.component.scss",
    templateUrl: "./rich-text-page.component.html",
})
export class RichTextPageComponent {
    protected readonly fullDraft = signal(SAMPLE_HTML);
    protected readonly compactDraft = signal(
        '<p><strong>Toujours partant</strong> pour une <em>dernière partie</em>, <span style="color: #3366ff">même à 2 h du matin</span>.</p>',
    );

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
        { name: "value", type: "string", default: "''", description: "HTML courant (modèle bidirectionnel)." },
        {
            name: "compact",
            type: "boolean",
            default: "false",
            description: "Barre d’outils réduite (sans titres, listes ni lien) pour les champs courts.",
        },
        { name: "placeholder", type: "string", default: "''", description: "Texte fantôme TipTap." },
        {
            name: "maxLength",
            type: "number | null",
            default: "null",
            description: "Limite en caractères de texte brut ; affiche le compteur.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Désactive la saisie." },
    ];

    protected readonly contentInputs: ApiRow[] = [
        { name: "html", type: "string", default: "''", description: "HTML à afficher après assainissement client." },
    ];

    protected readonly previewHtml = (): string => this.fullDraft();

    protected blankLabel(): string {
        return isRichHtmlBlank(this.fullDraft()) ? "oui" : "non";
    }

    protected plainPreview(): string {
        const text = stripRichHtmlPlainText(this.fullDraft());
        return text.length > 48 ? `${text.slice(0, 48)}…` : text;
    }

    /** TipTap serialises everything on one line, unreadable in a code block. */
    protected prettyHtml(): string {
        return this.fullDraft().replace(/(<\/(?:p|h2|h3|ul|ol|li)>)(?=<)/g, "$1\n");
    }
}
