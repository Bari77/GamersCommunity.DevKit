import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SkeletonTextComponent } from "@bari77/gc-ui";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-skeleton-text-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, SkeletonTextComponent],
    templateUrl: "./skeleton-text-page.component.html",
    styleUrl: "./skeleton-text-page.component.scss",
})
export class SkeletonTextPageComponent {
    protected readonly basicHtml = `<gc-skeleton-text />`;

    protected readonly denseHtml = `<gc-skeleton-text [lines]="6" lineHeight="0.7rem" gap="0.35rem" lastLineWidth="40%" />`;

    protected readonly usageSnippet = `@if (biography.isPending()) {
    <gc-skeleton-text [lines]="4" />
} @else {
    <p>{{ biography.value() }}</p>
}`;

    protected readonly inputs: ApiRow[] = [
        {
            name: "lines",
            type: "number",
            default: "3",
            description: "Nombre de lignes affichées, ramené à 1 au minimum.",
        },
        {
            name: "lineHeight",
            type: "string",
            default: "'0.9rem'",
            description: "Hauteur d'une ligne.",
        },
        {
            name: "gap",
            type: "string",
            default: "'0.5rem'",
            description: "Espace vertical entre deux lignes.",
        },
        {
            name: "radius",
            type: "string",
            default: "'0.25rem'",
            description: "Rayon des coins de chaque ligne.",
        },
        {
            name: "lastLineWidth",
            type: "string",
            default: "'60%'",
            description: "Largeur de la dernière ligne, plus courte par défaut pour imiter une fin de paragraphe.",
        },
    ];
}
