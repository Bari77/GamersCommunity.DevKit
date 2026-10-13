import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-typography-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, CodeBlockComponent],
    templateUrl: "./typography-page.component.html",
    styleUrl: "./typography-page.component.scss",
})
export class TypographyPageComponent {
    protected readonly scaleHtml = `<h1>Titre de niveau 1</h1>
<h2>Titre de niveau 2</h2>
<h3>Titre de niveau 3</h3>
<p class="gc-display">Classe gc-display sur un élément quelconque</p>
<p>Texte courant en police de corps.</p>`;

    protected readonly displaySnippet = `<span class="gc-display">{{ player.itemLevel }}</span>`;
}
