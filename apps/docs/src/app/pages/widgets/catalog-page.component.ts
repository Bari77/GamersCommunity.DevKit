import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-catalog-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-widgets"
            heading="Catalogue"
            lead="La déclaration des types de widgets disponibles : ce que propose le sélecteur, la taille de départ et les champs de réglage générés automatiquement."
        >
            <p>
                Le catalogue est une simple liste d'objets, sans classe ni enregistrement dynamique. Il se construit
                donc là où l'application dispose de son contexte, par exemple pour traduire les libellés ou masquer
                un type selon les droits.
            </p>

            <gcd-code language="typescript" [code]="catalogSnippet" />

            <h2>Entrée de catalogue</h2>

            <gcd-api [rows]="entry" />

            <h2>Champs de réglage</h2>

            <p>
                Le panneau de réglages est généré à partir de <code>fields</code> : il n'y a rien à écrire pour un
                widget dont les réglages tiennent en quelques champs simples. Deux formes existent.
            </p>

            <h3>Champ simple</h3>

            <gcd-api [rows]="textField" />

            <h3>Champ répétable</h3>

            <p>
                Un champ de type <code>list</code> répète un groupe de champs, ce qui permet à un widget de porter
                un nombre libre d'entrées — des liens, des personnages, des vidéos.
            </p>

            <gcd-api [rows]="listField" />

            <gcd-code language="typescript" label="Un champ répétable" [code]="listSnippet" />

            <h2>Réglages sur mesure</h2>

            <p>
                Quand les champs générés ne suffisent pas, la directive <code>gcWidgetSettings</code> ajoute votre
                propre interface <strong>sous</strong> les champs générés, pour un type donné. Elle reçoit le même
                contexte que le gabarit de rendu. C'est là que se déclare, par exemple, la gestion d'un contenu qui
                vit dans le backend de l'application plutôt que dans les réglages.
            </p>

            <gcd-code language="html" [code]="customSnippet" />

            <h2>Titre du widget</h2>

            <p>
                Un champ de titre est ajouté à tous les widgets sans avoir à le déclarer. Il est stocké dans les
                réglages sous la clé exportée <code>WIDGET_TITLE_KEY</code>, et un titre vide masque l'en-tête du
                widget.
            </p>

            <h2>Aides</h2>

            <gcd-api [rows]="helpers" [showDefault]="false" />

            <div class="gcd-note">
                <p>
                    <code>unique</code> refuse une seconde instance <strong>dans tout le workspace</strong>, pas
                    seulement sur la page courante : c'est le bon réglage pour un widget d'identité, mais pas pour
                    une note.
                </p>
            </div>
        </gcd-page>
    `,
})
export class CatalogPageComponent {
    protected readonly catalogSnippet = `import type { WidgetCatalog } from '@bari77/gc-widgets';

const catalog: WidgetCatalog = [
    {
        type: 'notes',
        label: $localize\`:@@widgets.notes.label:Note\`,
        description: $localize\`:@@widgets.notes.hint:Un bloc de texte libre.\`,
        icon: 'file-text-outline',
        cols: 6,
        rows: 3,
        fields: [{ key: 'body', label: 'Texte', type: 'textarea' }],
        defaultSettings: { body: '' },
    },
    {
        type: 'identity',
        label: 'Identité',
        cols: 4,
        rows: 2,
        unique: true,
    },
];`;

    protected readonly listSnippet = `{
    key: 'links',
    label: 'Liens',
    type: 'list',
    addLabel: 'Ajouter un lien',
    itemFields: [
        { key: 'label', label: 'Libellé', type: 'text' },
        { key: 'url', label: 'Adresse', type: 'url', placeholder: 'https://…' },
    ],
}`;

    protected readonly customSnippet = `<gc-widget-workspace [workspace]="workspace()" [catalog]="catalog">
    <ng-template gcWidget="roster" let-settings>
        <app-roster [roster]="settings" />
    </ng-template>

    <ng-template gcWidgetSettings="roster" let-settings let-instance="instance">
        <app-roster-picker [settings]="settings" [instance]="instance" />
    </ng-template>
</gc-widget-workspace>`;

    protected readonly entry: ApiRow[] = [
        { name: 'type', type: 'string', default: 'requis', description: "Identifiant du type, stocké dans chaque instance." },
        { name: 'label', type: 'string', default: 'requis', description: 'Nom affiché dans le sélecteur.' },
        {
            name: 'description',
            type: 'string',
            description: 'Phrase affichée sous le nom dans le sélecteur.',
        },
        { name: 'icon', type: 'string', description: "Nom d'icône exploité par le sélecteur." },
        { name: 'cols', type: 'number', default: 'requis', description: 'Largeur de départ, en colonnes.' },
        { name: 'rows', type: 'number', default: 'requis', description: 'Hauteur de départ, en lignes.' },
        {
            name: 'unique',
            type: 'boolean',
            default: 'false',
            description: "Refuse une seconde instance de ce type n'importe où dans le workspace.",
        },
        {
            name: 'fields',
            type: 'WidgetSettingsField[]',
            description: 'Champs à générer dans le panneau de réglages.',
        },
        {
            name: 'defaultSettings',
            type: 'WidgetSettings',
            description: "Réglages copiés dans l'instance au moment où le widget est ajouté.",
        },
    ];

    protected readonly textField: ApiRow[] = [
        { name: 'key', type: 'string', default: 'requis', description: 'Clé de stockage dans les réglages.' },
        { name: 'label', type: 'string', default: 'requis', description: 'Libellé du champ.' },
        {
            name: 'type',
            type: "'text' | 'url' | 'textarea' | 'number'",
            default: 'requis',
            description: "Nature du champ, qui détermine le contrôle rendu.",
        },
        { name: 'placeholder', type: 'string', description: 'Texte indicatif du champ vide.' },
        { name: 'hint', type: 'string', description: 'Aide affichée sous le champ.' },
    ];

    protected readonly listField: ApiRow[] = [
        { name: 'key', type: 'string', default: 'requis', description: 'Clé du tableau dans les réglages.' },
        { name: 'label', type: 'string', default: 'requis', description: 'Libellé du groupe.' },
        { name: 'type', type: "'list'", default: 'requis', description: 'Marque le champ comme répétable.' },
        { name: 'addLabel', type: 'string', description: "Libellé du bouton d'ajout d'une entrée." },
        {
            name: 'itemFields',
            type: 'WidgetTextField[]',
            default: 'requis',
            description: 'Champs répétés pour chaque entrée de la liste.',
        },
    ];

    protected readonly helpers: ApiRow[] = [
        {
            name: 'findCatalogEntry(catalog, type)',
            type: 'WidgetCatalogEntry | undefined',
            description: "Retrouve l'entrée décrivant un type.",
        },
        {
            name: 'isListField(field)',
            type: 'field is WidgetListField',
            description: 'Garde de type distinguant un champ répétable d\'un champ simple.',
        },
        {
            name: 'WIDGET_TITLE_KEY',
            type: 'string',
            description: 'Clé sous laquelle le titre commun du widget est rangé dans les réglages.',
        },
    ];
}
