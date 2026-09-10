import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    GcLink,
    LinkListComponent,
    WidgetCatalog,
    WidgetDefDirective,
    WidgetSettings,
    WidgetWorkspace,
    WidgetWorkspaceComponent,
    WIDGET_WORKSPACE_VERSION,
} from '@bari77/gc-widgets';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-workspace-page',
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
    ],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-widgets"
            heading="Workspace"
            selector="gc-widget-workspace"
            lead="Le tableau de bord complet : rail de pages, grille redimensionnable, catalogue et panneau de réglages, assemblés autour d'un brouillon local."
            [importSnippet]="importSnippet"
        >
            <p>
                Passez en mode édition pour déplacer un widget par son en-tête, le redimensionner par son coin, en
                ajouter depuis le catalogue ou gérer les pages. Rien n'est envoyé nulle part tant que vous
                n'enregistrez pas.
            </p>

            <gcd-demo title="Démonstration vivante" [html]="demoHtml" [ts]="demoTs" [bare]="true">
                <div class="gcd-workspace-frame">
                    <gc-widget-workspace
                        [workspace]="workspace()"
                        [catalog]="catalog"
                        [canEdit]="true"
                        [saving]="saving()"
                        [(editing)]="editing"
                        navLabel="Pages du profil"
                        addPageLabel="Nouvelle page"
                        removePageLabel="Supprimer la page"
                        moveUpLabel="Monter"
                        moveDownLabel="Descendre"
                        addWidgetLabel="Ajouter un widget"
                        editLabel="Modifier"
                        cancelLabel="Annuler"
                        saveLabel="Enregistrer"
                        emptyPageLabel="Cette page n'a pas encore de widget."
                        hintLabel="Glissez un widget par son en-tête pour le déplacer, ou par son coin pour le redimensionner."
                        newPageTitle="Nouvelle page"
                        settingsLabel="Réglages du widget"
                        removeWidgetLabel="Retirer le widget"
                        widgetTitleLabel="Titre du widget"
                        widgetTitleHint="Laissez vide pour masquer l'en-tête."
                        doneLabel="Terminé"
                        (save)="onSave($event)"
                    >
                        <ng-template gcWidget="notes" let-settings>
                            <p class="gcd-widget-text">{{ text(settings, "body") }}</p>
                        </ng-template>

                        <ng-template gcWidget="links" let-settings>
                            <gc-link-list [links]="links(settings)" emptyLabel="Aucun lien pour l'instant." />
                        </ng-template>
                    </gc-widget-workspace>
                </div>
            </gcd-demo>

            <h2>Assemblage minimal</h2>

            <p>
                Deux entrées sont obligatoires : le workspace committé et le catalogue. Tout le reste a une valeur
                par défaut.
            </p>

            <gcd-code language="html" [code]="minimalSnippet" />

            <h2>Le cycle d'enregistrement</h2>

            <p>
                Le composant émet un workspace normalisé et attend que l'appelant le persiste, puis republie la
                valeur committée. Traiter l'échec revient simplement à ne rien republier.
            </p>

            <gcd-code language="typescript" [code]="saveSnippet" />

            <h2>Entrées principales</h2>

            <gcd-api heading="Données et comportement" [rows]="coreInputs" />

            <gcd-api heading="Mise en page de la grille" [rows]="layoutInputs" />

            <h2>Libellés</h2>

            <p>
                Aucun texte n'est traduit par le package : chaque libellé visible est une entrée, avec une valeur
                anglaise par défaut. C'est ce qui permet à l'application de rester maîtresse de son i18n.
            </p>

            <gcd-api heading="Libellés" [rows]="labelInputs" />

            <h2>Sorties</h2>

            <gcd-api [rows]="outputs" [showDefault]="false" />

            <div class="gcd-note">
                <p>
                    <code>editing</code> est un <code>model()</code> : la barre d'édition le bascule elle-même, mais
                    l'application peut aussi le piloter, par exemple pour rouvrir l'édition après un échec
                    d'enregistrement.
                </p>
            </div>
        </gcd-page>
    `,
    styles: [
        `
            .gcd-workspace-frame {
                min-height: 26rem;
                border: 1px solid var(--gcd-border);
                border-radius: 0.45rem;
                background: var(--gc-surface-0);
                overflow: hidden;
            }

            .gcd-widget-text {
                margin: 0;
                font-size: 0.8125rem;
                line-height: 1.6;
                color: #c9d4ea;
            }
        `,
    ],
})
export class WorkspacePageComponent {
    protected readonly editing = signal(false);
    protected readonly saving = signal(false);

    protected readonly workspace = signal<WidgetWorkspace>({
        version: WIDGET_WORKSPACE_VERSION,
        pages: [
            {
                id: 'page-home',
                title: 'Profil',
                locked: true,
                widgets: [
                    {
                        id: 'w-notes',
                        type: 'notes',
                        x: 0,
                        y: 0,
                        cols: 6,
                        rows: 3,
                        settings: {
                            title: 'À propos',
                            body: "Tank principal, disponible en soirée. J'anime les raids du mercredi et du dimanche.",
                        },
                    },
                    {
                        id: 'w-links',
                        type: 'links',
                        x: 6,
                        y: 0,
                        cols: 6,
                        rows: 3,
                        settings: {
                            title: 'Mes liens',
                            links: [
                                { url: 'https://twitch.tv/gamerscommunity', label: 'Ma chaîne' },
                                { url: 'https://github.com/Bari77' },
                            ],
                        },
                    },
                ],
            },
            {
                id: 'page-guild',
                title: 'Guilde',
                widgets: [],
            },
        ],
    });

    protected readonly catalog: WidgetCatalog = [
        {
            type: 'notes',
            label: 'Note',
            description: 'Un bloc de texte libre.',
            cols: 6,
            rows: 3,
            fields: [
                {
                    key: 'body',
                    label: 'Texte',
                    type: 'textarea',
                    placeholder: 'Présentez-vous en quelques lignes',
                },
            ],
            defaultSettings: { body: 'Un mot sur moi.' },
        },
        {
            type: 'links',
            label: 'Liens',
            description: 'Une liste de liens vers vos réseaux.',
            cols: 6,
            rows: 3,
            fields: [
                {
                    key: 'links',
                    label: 'Liens',
                    type: 'list',
                    addLabel: 'Ajouter un lien',
                    itemFields: [
                        { key: 'label', label: 'Libellé', type: 'text', placeholder: 'Ma chaîne' },
                        { key: 'url', label: 'Adresse', type: 'url', placeholder: 'https://twitch.tv/…' },
                    ],
                },
            ],
            defaultSettings: { links: [] },
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
        return typeof value === 'string' ? value : '';
    }

    protected links(settings: WidgetSettings): GcLink[] {
        const value = settings['links'];
        return Array.isArray(value) ? (value as GcLink[]) : [];
    }

    protected readonly importSnippet = `import {
    WidgetDefDirective,
    WidgetWorkspaceComponent,
} from '@bari77/gc-widgets';

import type { WidgetCatalog, WidgetWorkspace } from '@bari77/gc-widgets';`;

    protected readonly demoHtml = `<gc-widget-workspace
    [workspace]="workspace()"
    [catalog]="catalog"
    [canEdit]="true"
    [saving]="saving()"
    [(editing)]="editing"
    (save)="onSave($event)"
>
    <ng-template gcWidget="notes" let-settings>
        <p>{{ text(settings, 'body') }}</p>
    </ng-template>

    <ng-template gcWidget="links" let-settings>
        <gc-link-list [links]="links(settings)" />
    </ng-template>
</gc-widget-workspace>`;

    protected readonly demoTs = `export class ProfileComponent {
    protected readonly editing = signal(false);
    protected readonly saving = signal(false);
    protected readonly workspace = signal<WidgetWorkspace>(initialWorkspace);

    protected readonly catalog: WidgetCatalog = [
        { type: 'notes', label: 'Note', cols: 6, rows: 3 },
        { type: 'links', label: 'Liens', cols: 6, rows: 3 },
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
            name: 'workspace',
            type: 'WidgetWorkspace',
            default: 'requis',
            description: "Workspace committé. Ne lui rebranchez pas la valeur de save avant qu'elle soit persistée.",
        },
        {
            name: 'catalog',
            type: 'WidgetCatalog',
            default: 'requis',
            description: 'Types de widgets proposés par le sélecteur et utilisés pour lire les réglages.',
        },
        {
            name: 'canEdit',
            type: 'boolean',
            default: 'false',
            description: "Affiche la barre d'édition et la roue crantée. À false, le tableau est en lecture seule.",
        },
        {
            name: 'saving',
            type: 'boolean',
            default: 'false',
            description: "Signale un enregistrement en cours à la barre d'édition.",
        },
        {
            name: 'editing',
            type: 'model<boolean>',
            default: 'false',
            description: "État du mode édition, liable dans les deux sens.",
        },
    ];

    protected readonly layoutInputs: ApiRow[] = [
        { name: 'columns', type: 'number', default: '12', description: 'Nombre de colonnes de la grille.' },
        { name: 'rowHeight', type: 'number', default: '90', description: "Hauteur d'une ligne, en pixels." },
        { name: 'gap', type: 'number', default: '12', description: 'Espace entre deux widgets, en pixels.' },
    ];

    protected readonly labelInputs: ApiRow[] = [
        { name: 'navLabel', type: 'string', default: "'Profile pages'", description: 'Étiquette du rail de pages.' },
        { name: 'addPageLabel', type: 'string', default: "'New page'", description: "Action d'ajout d'une page." },
        {
            name: 'removePageLabel',
            type: 'string',
            default: "'Delete page'",
            description: "Action de suppression d'une page.",
        },
        { name: 'moveUpLabel', type: 'string', default: "'Move up'", description: 'Déplacement vers le haut.' },
        { name: 'moveDownLabel', type: 'string', default: "'Move down'", description: 'Déplacement vers le bas.' },
        {
            name: 'addWidgetLabel',
            type: 'string',
            default: "'Add a widget'",
            description: 'Ouvre le sélecteur du catalogue.',
        },
        { name: 'editLabel', type: 'string', default: "'Edit'", description: "Entrée en mode édition." },
        { name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'Abandon des modifications.' },
        { name: 'saveLabel', type: 'string', default: "'Save'", description: 'Validation des modifications.' },
        {
            name: 'emptyPageLabel',
            type: 'string',
            default: "'This page has no widget yet.'",
            description: 'Message affiché sur une page vide.',
        },
        {
            name: 'hintLabel',
            type: 'string',
            default: "'Drag a widget by its header…'",
            description: "Consigne affichée en mode édition.",
        },
        {
            name: 'newPageTitle',
            type: 'string',
            default: "'New page'",
            description: 'Titre donné à une page fraîchement créée.',
        },
        {
            name: 'settingsLabel',
            type: 'string',
            default: "'Widget settings'",
            description: 'Étiquette de la roue crantée.',
        },
        {
            name: 'removeWidgetLabel',
            type: 'string',
            default: "'Remove widget'",
            description: "Action de retrait d'un widget.",
        },
        {
            name: 'widgetTitleLabel',
            type: 'string',
            default: "'Widget title'",
            description: 'Libellé du champ de titre, commun à tous les widgets.',
        },
        {
            name: 'widgetTitleHint',
            type: 'string',
            default: "'Leave empty to drop the header.'",
            description: 'Aide affichée sous le champ de titre.',
        },
        { name: 'doneLabel', type: 'string', default: "'Done'", description: 'Ferme le panneau de réglages.' },
    ];

    protected readonly outputs: ApiRow[] = [
        {
            name: 'save',
            type: 'OutputEmitterRef<WidgetWorkspace>',
            description:
                'Workspace normalisé à persister. Émis à la validation en mode édition, et à la fermeture du panneau de réglages hors édition si quelque chose a changé.',
        },
    ];
}
