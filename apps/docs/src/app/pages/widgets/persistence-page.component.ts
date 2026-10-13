import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-persistence-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    templateUrl: "./persistence-page.component.html",
    styleUrl: "./persistence-page.component.scss",
})
export class PersistencePageComponent {
    protected readonly writeSnippet = `protected onSave(next: WidgetWorkspace): void {
    // La valeur émise est déjà normalisée.
    this.api.saveWorkspace(serializeWorkspace(next)).subscribe(() => this.workspace.set(next));
}`;

    protected readonly readSnippet = `import { parseWorkspace } from '@bari77/gc-widgets';

const knownTypes = catalog.map((entry) => entry.type);

const workspace = parseWorkspace(
    response.workspaceJson, // peut être null, vide ou corrompu
    DEFAULT_WORKSPACE,      // repli utilisé dans ce cas
    12,                     // nombre de colonnes de la grille
    knownTypes,             // écarte les widgets d'un type retiré
);`;

    protected readonly defaultSnippet = `import { addPage, addWidget, WIDGET_WORKSPACE_VERSION } from '@bari77/gc-widgets';

let workspace: WidgetWorkspace = {
    version: WIDGET_WORKSPACE_VERSION,
    pages: [{ id: 'home', title: 'Profil', locked: true, widgets: [] }],
};

workspace = addWidget(workspace, 'home', { type: 'identity', cols: 4, rows: 2, settings: {} });
workspace = addPage(workspace, 'Équipe');`;

    protected readonly io: ApiRow[] = [
        {
            name: "parseWorkspace(raw, fallback, columns?, knownTypes?)",
            type: "WidgetWorkspace",
            description:
                "Reconstruit un workspace depuis sa forme stockée. Retombe sur fallback si la charge utile est absente, illisible ou vide, et migre la version 1.",
        },
        {
            name: "serializeWorkspace(workspace)",
            type: "string",
            description: "Sérialise en JSON. Utile aussi pour comparer deux états.",
        },
        {
            name: "normalizeWorkspace(workspace, columns)",
            type: "WidgetWorkspace",
            description: "Réparation : bornes de la grille, arrondis et identifiants dupliqués.",
        },
        {
            name: "cloneWorkspace(workspace)",
            type: "WidgetWorkspace",
            description: "Copie profonde, réglages compris.",
        },
        { name: "clonePage(page)", type: "WidgetPage", description: "Copie profonde d'une seule page." },
        {
            name: "createId(prefix)",
            type: "string",
            description: "Identifiant court préfixé, tiré de crypto.randomUUID quand il est disponible.",
        },
        {
            name: "WIDGET_WORKSPACE_VERSION",
            type: "number",
            description: "Version du format écrite par la normalisation. Vaut 2.",
        },
    ];

    protected readonly mutations: ApiRow[] = [
        { name: "addPage(workspace, title)", type: "WidgetWorkspace", description: "Ajoute une page à la fin." },
        {
            name: "renamePage(workspace, pageId, title)",
            type: "WidgetWorkspace",
            description: "Renomme une page, sauf si elle est verrouillée.",
        },
        {
            name: "removePage(workspace, pageId)",
            type: "WidgetWorkspace",
            description: "Supprime une page, sauf si elle est verrouillée ou seule.",
        },
        {
            name: "movePage(workspace, pageId, offset)",
            type: "WidgetWorkspace",
            description: "Déplace une page dans l'ordre du rail.",
        },
        {
            name: "addWidget(workspace, pageId, widget)",
            type: "WidgetWorkspace",
            description: "Place un widget sous les autres, identifiant et position calculés.",
        },
        {
            name: "removeWidget(workspace, pageId, widgetId)",
            type: "WidgetWorkspace",
            description: "Retire un widget d'une page.",
        },
        {
            name: "updateWidgetSettings(workspace, pageId, widgetId, settings)",
            type: "WidgetWorkspace",
            description: "Remplace les réglages d'une instance.",
        },
        {
            name: "applyPositions(workspace, pageId, positions)",
            type: "WidgetWorkspace",
            description: "Applique les positions rapportées par la grille sans toucher au type ni aux réglages.",
        },
        {
            name: "findPage(workspace, pageId)",
            type: "WidgetPage | undefined",
            description: "Retrouve une page par son identifiant.",
        },
        {
            name: "countWidgetsOfType(workspace, type)",
            type: "number",
            description: "Compte les instances d'un type dans tout le workspace.",
        },
    ];
}
