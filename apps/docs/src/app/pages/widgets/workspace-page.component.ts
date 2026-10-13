import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
    GcLink,
    LinkListComponent,
    WidgetCatalog,
    WidgetDefDirective,
    WidgetSettings,
    WidgetWorkspace,
    WidgetWorkspaceComponent,
    WIDGET_WORKSPACE_VERSION,
} from "@bari77/gc-widgets";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";
import { DemoNoteComponent } from "./demo-note.component";

@Component({
    selector: "gcd-workspace-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PageComponent,
        DemoComponent,
        ApiTableComponent,
        CodeBlockComponent,
        WidgetWorkspaceComponent,
        WidgetDefDirective,
        LinkListComponent,
        DemoNoteComponent,
    ],
    templateUrl: "./workspace-page.component.html",
    styleUrl: "./workspace-page.component.scss",
})
export class WorkspacePageComponent {
    protected readonly editing = signal(false);
    protected readonly saving = signal(false);

    protected readonly workspace = signal<WidgetWorkspace>({
        version: WIDGET_WORKSPACE_VERSION,
        pages: [
            {
                id: "page-home",
                title: "Profil",
                locked: true,
                widgets: [
                    {
                        id: "w-notes",
                        type: "notes",
                        x: 0,
                        y: 0,
                        cols: 6,
                        rows: 5,
                        settings: {
                            title: "À propos",
                            body: "<p>Joueuse du soir, disponible en semaine. J'organise les sessions du mercredi et du dimanche.</p>",
                        },
                    },
                    {
                        id: "w-links",
                        type: "links",
                        x: 6,
                        y: 0,
                        cols: 6,
                        rows: 3,
                        settings: {
                            title: "Mes liens",
                            links: [
                                { url: "https://twitch.tv/gamerscommunity", label: "Ma chaîne" },
                                { url: "https://github.com/Bari77" },
                            ],
                        },
                    },
                    {
                        id: "w-twitch",
                        type: "gc-twitch",
                        x: 6,
                        y: 3,
                        cols: 6,
                        rows: 5,
                        settings: { title: "En live", channel: "shroud" },
                    },
                    {
                        id: "w-photos",
                        type: "gc-photos",
                        x: 0,
                        y: 5,
                        cols: 6,
                        rows: 5,
                        settings: {
                            title: "Photos",
                            items: [
                                { url: "https://picsum.photos/seed/gc-match/640/360", title: "Fin de partie" },
                                { url: "https://picsum.photos/seed/gc-team/640/360", title: "Photo d'équipe" },
                            ],
                        },
                    },
                    {
                        id: "w-videos",
                        type: "gc-videos",
                        x: 6,
                        y: 8,
                        cols: 6,
                        rows: 5,
                        settings: {
                            title: "Vidéos",
                            items: [{ url: "https://www.youtube.com/watch?v=jNQXAC9IVRw", title: "Me at the zoo" }],
                        },
                    },
                ],
            },
            {
                id: "page-team",
                title: "Équipe",
                widgets: [],
            },
        ],
    });

    protected readonly catalog: WidgetCatalog = [
        {
            type: "notes",
            label: "Note",
            description: "Un bloc de texte libre.",
            cols: 6,
            rows: 5,
            defaultSettings: { body: "<p>Un mot sur moi.</p>" },
        },
        {
            type: "links",
            label: "Liens",
            description: "Une liste de liens vers vos réseaux.",
            cols: 6,
            rows: 3,
            defaultSettings: { links: [] },
        },
        {
            type: "gc-twitch",
            label: "Twitch",
            description: "Le lecteur d’une chaîne.",
            cols: 6,
            rows: 5,
        },
        {
            type: "gc-photos",
            label: "Photos",
            description: "Une galerie d’images.",
            cols: 6,
            rows: 5,
            defaultSettings: { items: [] },
        },
        {
            type: "gc-videos",
            label: "Vidéos",
            description: "Une galerie de lecteurs vidéo.",
            cols: 6,
            rows: 5,
            defaultSettings: { items: [] },
        },
    ];

    protected readonly demoHtml = `<gc-widget-workspace
    [workspace]="workspace()"
    [catalog]="catalog"
    [canEdit]="true"
    [saving]="saving()"
    [(editing)]="editing"
    (save)="onSave($event)"
>
    <ng-template
        gcWidget="notes"
        gcWidgetEditable
        let-settings
        let-editingData="editingData"
        let-stopDataEdit="stopDataEdit"
        let-updateSettings="updateSettings"
    >
        @if (editingData) {
            <gc-rich-editor
                [value]="text(settings, 'body')"
                (valueChange)="updateSettings?.({ ...settings, body: $event })"
                [maxLength]="4000"
            ></gc-rich-editor>
        } @else {
            <gc-rich-content [html]="text(settings, 'body')"></gc-rich-content>
        }
    </ng-template>

    <ng-template
        gcWidget="links"
        gcWidgetEditable
        let-settings
        let-editingData="editingData"
        let-stopDataEdit="stopDataEdit"
        let-updateSettings="updateSettings"
    >
        <gc-link-list
            [links]="links(settings)"
            [editing]="!!editingData"
            (linksChange)="updateSettings?.({ ...settings, links: $event }); stopDataEdit?.()"
            (cancel)="stopDataEdit?.()"
        ></gc-link-list>
    </ng-template>
</gc-widget-workspace>`;

    protected readonly demoTs = `export class ProfileComponent {
    protected readonly editing = signal(false);
    protected readonly saving = signal(false);
    protected readonly workspace = signal<WidgetWorkspace>(initialWorkspace);

    protected readonly catalog: WidgetCatalog = [
        { type: 'notes', label: 'Note', cols: 6, rows: 3 },
        { type: 'links', label: 'Liens', cols: 6, rows: 3 },
        { type: 'gc-twitch', label: 'Twitch', cols: 6, rows: 5 },
        { type: 'gc-photos', label: 'Photos', cols: 6, rows: 5 },
        { type: 'gc-videos', label: 'Vidéos', cols: 6, rows: 5 },
    ];

    protected onSave(next: WidgetWorkspace): void {
        this.saving.set(true);
        this.api.saveWorkspace(next).subscribe({
            next: () => {
                this.workspace.set(next);
                this.editing.set(false);
                this.saving.set(false);
            },
            // On failure nothing is republished: edit mode keeps the changes.
            error: () => this.saving.set(false),
        });
    }
}`;

    protected readonly minimalSnippet = `<gc-widget-workspace [workspace]="workspace()" [catalog]="catalog">
    <ng-template gcWidget="notes" let-settings>
        <p>{{ text(settings, 'body') }}</p>
    </ng-template>
</gc-widget-workspace>`;

    protected readonly saveSnippet = `protected onSave(next: WidgetWorkspace): void {
    this.saving.set(true);
    this.api.saveWorkspace(next).subscribe({
        next: () => {
            this.workspace.set(next);
            this.editing.set(false);
            this.saving.set(false);
        },
        error: () => this.saving.set(false),
    });
}`;

    protected readonly coreInputs: ApiRow[] = [
        {
            name: "workspace",
            type: "WidgetWorkspace",
            default: "requis",
            description: "Workspace committé. Ne lui rebranchez pas la valeur de save avant qu'elle soit persistée.",
        },
        {
            name: "catalog",
            type: "WidgetCatalog",
            default: "requis",
            description: "Types de widgets proposés par le sélecteur et utilisés pour lire les réglages.",
        },
        {
            name: "canEdit",
            type: "boolean",
            default: "false",
            description:
                "Affiche la barre d'édition, le crayon (données) et la roue crantée (réglages). À false, le tableau est en lecture seule.",
        },
        {
            name: "saving",
            type: "boolean",
            default: "false",
            description: "Signale un enregistrement en cours à la barre d'édition.",
        },
        {
            name: "editing",
            type: "model<boolean>",
            default: "false",
            description: "État du mode édition, liable dans les deux sens.",
        },
    ];

    protected readonly layoutInputs: ApiRow[] = [
        { name: "columns", type: "number", default: "12", description: "Nombre de colonnes de la grille." },
        { name: "rowHeight", type: "number", default: "90", description: "Hauteur d'une ligne, en pixels." },
        { name: "gap", type: "number", default: "12", description: "Espace entre deux widgets, en pixels." },
    ];

    protected readonly labelInputs: ApiRow[] = [
        { name: "navLabel", type: "string", default: "'Profile pages'", description: "Étiquette du rail de pages." },
        { name: "addPageLabel", type: "string", default: "'New page'", description: "Action d'ajout d'une page." },
        {
            name: "removePageLabel",
            type: "string",
            default: "'Delete page'",
            description: "Action de suppression d'une page.",
        },
        { name: "moveUpLabel", type: "string", default: "'Move up'", description: "Déplacement vers le haut." },
        { name: "moveDownLabel", type: "string", default: "'Move down'", description: "Déplacement vers le bas." },
        {
            name: "addWidgetLabel",
            type: "string",
            default: "'Add a widget'",
            description: "Ouvre le sélecteur du catalogue.",
        },
        { name: "editLabel", type: "string", default: "'Edit'", description: "Entrée en mode édition." },
        { name: "cancelLabel", type: "string", default: "'Cancel'", description: "Abandon des modifications." },
        { name: "saveLabel", type: "string", default: "'Save'", description: "Validation des modifications." },
        {
            name: "emptyPageLabel",
            type: "string",
            default: "'This page has no widget yet.'",
            description: "Message affiché sur une page vide.",
        },
        {
            name: "hintLabel",
            type: "string",
            default: "'Drag a widget by its header…'",
            description: "Consigne affichée en mode édition.",
        },
        {
            name: "newPageTitle",
            type: "string",
            default: "'New page'",
            description: "Titre donné à une page fraîchement créée.",
        },
        {
            name: "settingsLabel",
            type: "string",
            default: "'Widget settings'",
            description: "Étiquette de la roue crantée.",
        },
        {
            name: "editDataLabel",
            type: "string",
            default: "'Edit data'",
            description: "Infobulle du crayon : remplace le contenu du widget par son éditeur, hors mode mise en page.",
        },
        {
            name: "removeWidgetLabel",
            type: "string",
            default: "'Remove widget'",
            description: "Action de retrait d'un widget.",
        },
        {
            name: "widgetTitleLabel",
            type: "string",
            default: "'Widget title'",
            description: "Libellé du champ de titre, commun à tous les widgets.",
        },
        {
            name: "widgetTitleHint",
            type: "string",
            default: "'Leave empty to drop the header.'",
            description: "Aide affichée sous le champ de titre.",
        },
        { name: "doneLabel", type: "string", default: "'Done'", description: "Ferme la modale de réglages." },
    ];

    protected readonly outputs: ApiRow[] = [
        {
            name: "save",
            type: "OutputEmitterRef<WidgetWorkspace>",
            description:
                "Workspace normalisé à persister. Émis à la validation en mode édition, et à la fermeture de la modale de réglages hors édition si quelque chose a changé.",
        },
    ];

    protected onSave(next: WidgetWorkspace): void {
        this.saving.set(true);
        // Stands in for the round trip to the API the host application would make.
        setTimeout(() => {
            this.workspace.set(next);
            this.saving.set(false);
            this.editing.set(false);
        }, 700);
    }

    protected text(settings: WidgetSettings, key: string): string {
        const value = settings[key];
        return typeof value === "string" ? value : "";
    }

    protected links(settings: WidgetSettings): GcLink[] {
        const value = settings["links"];
        return Array.isArray(value) ? (value as GcLink[]) : [];
    }
}
