import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DocsCard } from "../docs-card.model";

/** Grid of links into other documentation pages, fed straight from the docs tree. */
@Component({
    selector: "gcd-card-grid",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    templateUrl: "./card-grid.component.html",
    styleUrl: "./card-grid.component.scss",
})
export class CardGridComponent {
    public readonly cards = input.required<DocsCard[]>();
}
