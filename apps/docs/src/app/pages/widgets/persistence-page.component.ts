import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-persistence-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    template: `
        <gcd-page
            lead="Un workspace est une structure sérialisable, que l'application stocke où elle veut. Le package fournit de quoi le relire sans jamais se casser sur une donnée abîmée."
        >
            <h2>Écrire</h2>

            <p>
                La valeur émise par <code>save</code> est déjà normalisée : elle peut partir telle quelle vers le
                serveur. <code>serializeWorkspace</code> n'est qu'un <code>JSON.stringify</code> nommé, utile pour
                comparer deux états.
            </p>

            <gcd-code language="typescript" [code]="writeSnippet" />

            <h2>Relire</h2>

            <p>
                <code>parseWorkspace</code> est volontairement indulgent : une charge utile absente, illisible ou
                vide retombe sur le workspace par défaut plutôt que de lever. C'est ce qui permet d'afficher un
                profil même après une écriture ratée.
            </p>

            <gcd-code language="typescript" [code]="readSnippet" />

            <p>
                Le quatrième argument mérite l'attention : en lui passant les types que le build courant connaît,
                les widgets d'un type retiré sont écartés à la lecture. Sans cela, supprimer un widget du catalogue
                casserait les pages qui l'utilisaient encore.
            </p>

            <h2>Normalisation</h2>

            <p>
                <code>normalizeWorkspace</code> ramène chaque widget dans la grille : largeur bornée au nombre de
                colonnes, position remise dans les limites, dimensions arrondies et au moins égales à 1, et
                identifiants dupliqués réattribués. C'est la réparation appliquée après un glissement douteux, une
                charge utile modifiée à la main ou un changement du nombre de colonnes.
            </p>

            <h2>Migration depuis la version 1</h2>

            <p>
                La version 1 stockait un simple tableau plat dont l'<code>id</code> portait le type du widget.
                <code>parseWorkspace</code> reconnaît cette forme et la reverse dans la première page du workspace
                par défaut, en conservant les pages suivantes. La constante
                <code>WIDGET_WORKSPACE_VERSION</code> vaut aujourd'hui <code>2</code>.
            </p>

            <h2>API</h2>

            <gcd-api heading="Lecture et écriture" [rows]="io" [showDefault]="false" />

            <gcd-api heading="Manipulation" [rows]="mutations" [showDefault]="false" />

            <p>
                Les fonctions de manipulation sont pures : elles renvoient un nouveau workspace sans modifier celui
                qu'on leur passe. Le composant s'en sert pour son brouillon, mais elles restent utiles pour
                préparer un workspace par défaut côté application.
            </p>

            <gcd-code language="typescript" label="Composer un workspace par défaut" [code]="defaultSnippet" />

            <div class="gcd-note">
                <p>
                    <code>removePage</code> refuse de supprimer une page verrouillée, ainsi que la dernière page
                    restante : un workspace conserve toujours au moins une page.
                </p>
            </div>
        </gcd-page>
    `,
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
workspace = addPage(workspace, 'Guilde');`;

    protected readonly io: ApiRow[] = [
        {
            name: 'parseWorkspace(raw, fallback, columns?, knownTypes?)',
            type: 'WidgetWorkspace',
            description:
                "Reconstruit un workspace depuis sa forme stockée. Retombe sur fallback si la charge utile est absente, illisible ou vide, et migre la version 1.",
        },
        {
            name: 'serializeWorkspace(workspace)',
            type: 'string',
            description: 'Sérialise en JSON. Utile aussi pour comparer deux états.',
        },
        {
            name: 'normalizeWorkspace(workspace, columns)',
            type: 'WidgetWorkspace',
            description: 'Réparation : bornes de la grille, arrondis et identifiants dupliqués.',
        },
        {
            name: 'cloneWorkspace(workspace)',
            type: 'WidgetWorkspace',
            description: 'Copie profonde, réglages compris.',
        },
        { name: 'clonePage(page)', type: 'WidgetPage', description: "Copie profonde d'une seule page." },
        {
            name: 'createId(prefix)',
            type: 'string',
            description: "Identifiant court préfixé, tiré de crypto.randomUUID quand il est disponible.",
        },
        {
            name: 'WIDGET_WORKSPACE_VERSION',
            type: 'number',
            description: 'Version du format écrite par la normalisation. Vaut 2.',
        },
    ];

    protected readonly mutations: ApiRow[] = [
        { name: 'addPage(workspace, title)', type: 'WidgetWorkspace', description: 'Ajoute une page à la fin.' },
        {
            name: 'renamePage(workspace, pageId, title)',
            type: 'WidgetWorkspace',
            description: 'Renomme une page, sauf si elle est verrouillée.',
        },
        {
            name: 'removePage(workspace, pageId)',
            type: 'WidgetWorkspace',
            description: 'Supprime une page, sauf si elle est verrouillée ou seule.',
        },
        {
            name: 'movePage(workspace, pageId, offset)',
            type: 'WidgetWorkspace',
            description: "Déplace une page dans l'ordre du rail.",
        },
        {
            name: 'addWidget(workspace, pageId, widget)',
            type: 'WidgetWorkspace',
            description: 'Place un widget sous les autres, identifiant et position calculés.',
        },
        {
            name: 'removeWidget(workspace, pageId, widgetId)',
            type: 'WidgetWorkspace',
            description: "Retire un widget d'une page.",
        },
        {
            name: 'updateWidgetSettings(workspace, pageId, widgetId, settings)',
            type: 'WidgetWorkspace',
            description: "Remplace les réglages d'une instance.",
        },
        {
            name: 'applyPositions(workspace, pageId, positions)',
            type: 'WidgetWorkspace',
            description: 'Applique les positions rapportées par la grille sans toucher au type ni aux réglages.',
        },
        {
            name: 'findPage(workspace, pageId)',
            type: 'WidgetPage | undefined',
            description: 'Retrouve une page par son identifiant.',
        },
        {
            name: 'countWidgetsOfType(workspace, type)',
            type: 'number',
            description: "Compte les instances d'un type dans tout le workspace.",
        },
    ];
}
