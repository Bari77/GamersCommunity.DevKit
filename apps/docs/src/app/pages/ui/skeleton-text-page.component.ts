import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonTextComponent } from '@bari77/gc-ui';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-skeleton-text-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, SkeletonTextComponent],
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-ui"
            heading="Skeleton text"
            selector="gc-skeleton-text"
            lead="Empilement de lignes de squelette imitant un paragraphe, avec une dernière ligne plus courte pour que le bloc se lise comme du texte."
            [importSnippet]="importSnippet"
        >
            <p>
                C'est un assemblage de <code>gc-skeleton</code>, pensé pour le cas très fréquent du bloc de texte.
                Plutôt que d'aligner des lignes à la main, on donne leur nombre.
            </p>

            <gcd-demo title="Paragraphe par défaut" description="Trois lignes, la dernière à 60 % de large." [html]="basicHtml" [bare]="true">
                <gc-skeleton-text />
            </gcd-demo>

            <gcd-demo title="Bloc dense" description="Plus de lignes, resserrées et plus fines." [html]="denseHtml" [bare]="true">
                <gc-skeleton-text [lines]="6" lineHeight="0.7rem" gap="0.35rem" lastLineWidth="40%" />
            </gcd-demo>

            <h2>Usage courant</h2>

            <gcd-code language="html" [code]="usageSnippet" />

            <h2>API</h2>

            <gcd-api heading="Entrées" [rows]="inputs" />

            <div class="gcd-note">
                <p>
                    <code>lines</code> est ramené à 1 au minimum : une valeur nulle ou négative n'efface pas le bloc,
                    elle affiche une seule ligne.
                </p>
            </div>
        </gcd-page>
    `,
})
export class SkeletonTextPageComponent {
    protected readonly importSnippet = `import { SkeletonTextComponent } from '@bari77/gc-ui';`;

    protected readonly basicHtml = `<gc-skeleton-text />`;

    protected readonly denseHtml = `<gc-skeleton-text [lines]="6" lineHeight="0.7rem" gap="0.35rem" lastLineWidth="40%" />`;

    protected readonly usageSnippet = `@if (biography.isPending()) {
    <gc-skeleton-text [lines]="4" />
} @else {
    <p>{{ biography.value() }}</p>
}`;

    protected readonly inputs: ApiRow[] = [
        {
            name: 'lines',
            type: 'number',
            default: '3',
            description: 'Nombre de lignes affichées, ramené à 1 au minimum.',
        },
        {
            name: 'lineHeight',
            type: 'string',
            default: "'0.9rem'",
            description: "Hauteur d'une ligne.",
        },
        {
            name: 'gap',
            type: 'string',
            default: "'0.5rem'",
            description: 'Espace vertical entre deux lignes.',
        },
        {
            name: 'radius',
            type: 'string',
            default: "'0.25rem'",
            description: 'Rayon des coins de chaque ligne.',
        },
        {
            name: 'lastLineWidth',
            type: 'string',
            default: "'60%'",
            description: 'Largeur de la dernière ligne, plus courte par défaut pour imiter une fin de paragraphe.',
        },
    ];
}
