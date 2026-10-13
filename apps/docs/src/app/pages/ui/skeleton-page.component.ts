import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SkeletonComponent } from "@bari77/gc-ui";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-skeleton-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, SkeletonComponent],
    templateUrl: "./skeleton-page.component.html",
    styleUrl: "./skeleton-page.component.scss",
})
export class SkeletonPageComponent {
    protected readonly basicHtml = `<gc-skeleton width="18rem" height="1.25rem" />
<gc-skeleton width="12rem" height="1.25rem" />
<gc-skeleton width="18rem" height="6rem" radius="0.6rem" />`;

    protected readonly circleHtml = `<gc-skeleton shape="circle" width="4rem" height="4rem" />`;

    protected readonly usageSnippet = `@if (players.isPending()) {
    <gc-skeleton width="100%" height="3rem" radius="0.5rem" />
} @else {
    <app-player-row [player]="players.value()" />
}`;

    protected readonly inputs: ApiRow[] = [
        {
            name: "width",
            type: "string",
            default: "'100%'",
            description: "Largeur appliquée telle quelle en CSS.",
        },
        {
            name: "height",
            type: "string",
            default: "'1rem'",
            description: "Hauteur appliquée telle quelle en CSS.",
        },
        {
            name: "radius",
            type: "string",
            default: "'0.25rem'",
            description: "Rayon des coins. Ignoré lorsque shape vaut circle.",
        },
        {
            name: "shape",
            type: "'rect' | 'circle'",
            default: "'rect'",
            description: "La forme circle force un rayon de 50 %, pour un avatar ou une pastille.",
        },
    ];
}
