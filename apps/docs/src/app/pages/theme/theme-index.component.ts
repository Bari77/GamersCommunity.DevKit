import { ChangeDetectionStrategy, Component } from "@angular/core";
import { pageCards } from "../../docs.config";
import { CardGridComponent } from "../../shared/card-grid.component";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";
import { themePartialsSnippet, themeStylesSnippet } from "../../shared/snippets";

@Component({
    selector: "gcd-theme-index",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent, CardGridComponent],
    templateUrl: "./theme-index.component.html",
    styleUrl: "./theme-index.component.scss",
})
export class ThemeIndexComponent {
    protected readonly cards = pageCards("theme");

    protected readonly globalSnippet = themeStylesSnippet();

    protected readonly partialSnippet = themePartialsSnippet(["tokens", "typography", "motion"]);
}
