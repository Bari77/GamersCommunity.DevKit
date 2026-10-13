import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-catalog-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent, RouterLink],
    templateUrl: "./catalog-page.component.html",
    styleUrl: "./catalog-page.component.scss",
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

    protected readonly customSnippet = `<ng-template
    gcWidget="links"
    gcWidgetEditable
    let-editingData="editingData"
    let-stopDataEdit="stopDataEdit"
>
    @if (editingData) {
        <app-link-admin (done)="stopDataEdit()" />
    } @else {
        <app-link-list />
    }
</ng-template>`;

    protected readonly entry: ApiRow[] = [
        {
            name: "type",
            type: "string",
            default: "requis",
            description: "Identifiant du type, stocké dans chaque instance.",
        },
        { name: "label", type: "string", default: "requis", description: "Nom affiché dans le sélecteur." },
        {
            name: "description",
            type: "string",
            description: "Phrase affichée sous le nom dans le sélecteur.",
        },
        { name: "icon", type: "string", description: "Nom d'icône exploité par le sélecteur." },
        { name: "cols", type: "number", default: "requis", description: "Largeur de départ, en colonnes." },
        { name: "rows", type: "number", default: "requis", description: "Hauteur de départ, en lignes." },
        {
            name: "unique",
            type: "boolean",
            default: "false",
            description: "Refuse une seconde instance de ce type n'importe où dans le workspace.",
        },
        {
            name: "fields",
            type: "WidgetSettingsField[]",
            description: "Champs à générer dans la modale de réglages.",
        },
        {
            name: "defaultSettings",
            type: "WidgetSettings",
            description: "Réglages copiés dans l'instance au moment où le widget est ajouté.",
        },
    ];

    protected readonly textField: ApiRow[] = [
        { name: "key", type: "string", default: "requis", description: "Clé de stockage dans les réglages." },
        { name: "label", type: "string", default: "requis", description: "Libellé du champ." },
        {
            name: "type",
            type: "'text' | 'url' | 'textarea' | 'number'",
            default: "requis",
            description: "Nature du champ, qui détermine le contrôle rendu.",
        },
        { name: "placeholder", type: "string", description: "Texte indicatif du champ vide." },
        { name: "hint", type: "string", description: "Aide affichée sous le champ." },
    ];

    protected readonly listField: ApiRow[] = [
        { name: "key", type: "string", default: "requis", description: "Clé du tableau dans les réglages." },
        { name: "label", type: "string", default: "requis", description: "Libellé du groupe." },
        { name: "type", type: "'list'", default: "requis", description: "Marque le champ comme répétable." },
        { name: "addLabel", type: "string", description: "Libellé du bouton d'ajout d'une entrée." },
        {
            name: "itemFields",
            type: "WidgetTextField[]",
            default: "requis",
            description: "Champs répétés pour chaque entrée de la liste.",
        },
    ];

    protected readonly helpers: ApiRow[] = [
        {
            name: "findCatalogEntry(catalog, type)",
            type: "WidgetCatalogEntry | undefined",
            description: "Retrouve l'entrée décrivant un type.",
        },
        {
            name: "isListField(field)",
            type: "field is WidgetListField",
            description: "Garde de type distinguant un champ répétable d'un champ simple.",
        },
        {
            name: "WIDGET_TITLE_KEY",
            type: "string",
            description: "Clé sous laquelle le titre commun du widget est rangé dans les réglages.",
        },
    ];
}
