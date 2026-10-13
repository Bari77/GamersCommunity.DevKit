import { ChangeDetectionStrategy, Component } from "@angular/core";
import { pageCards } from "../../docs.config";
import { CardGridComponent } from "../../shared/card-grid.component";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";
import { sectionImportSnippet } from "../../shared/snippets";

@Component({
    selector: "gcd-ui-index",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent, CardGridComponent],
    templateUrl: "./ui-index.component.html",
    styleUrl: "./ui-index.component.scss",
})
export class UiIndexComponent {
    protected readonly cards = pageCards("ui");

    protected readonly importSnippet = sectionImportSnippet("ui");
}
