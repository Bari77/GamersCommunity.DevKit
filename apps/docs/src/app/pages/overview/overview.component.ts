import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ANGULAR_RANGE, packageCards } from "../../docs.config";
import { CardGridComponent } from "../../shared/card-grid.component";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";
import { lockstepSnippet } from "../../shared/snippets";

@Component({
    selector: "gcd-overview",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent, CardGridComponent, RouterLink],
    templateUrl: "./overview.component.html",
    styleUrl: "./overview.component.scss",
})
export class OverviewComponent {
    protected readonly cards = packageCards;

    protected readonly angularRange = ANGULAR_RANGE;

    protected readonly lockstepSnippet = lockstepSnippet();
}
