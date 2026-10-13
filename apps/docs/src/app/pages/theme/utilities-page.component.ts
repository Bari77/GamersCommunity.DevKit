import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-utilities-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent],
    templateUrl: "./utilities-page.component.html",
    styleUrl: "./utilities-page.component.scss",
})
export class UtilitiesPageComponent {
    protected readonly flexHtml = `<div class="actions flex-end">
    <button type="button">Annuler</button>
    <button type="button">Enregistrer</button>
</div>`;

    protected readonly shellSnippet = `nb-layout-header.fixed {
    z-index: 1040;
}

.nb-theme-cosmic nb-layout-header,
nb-layout-header {
    font-family: var(--gc-font-body);
}`;

    protected readonly classes: ApiRow[] = [
        { name: ".ml-sm", type: "espacement", description: "Applique une marge à gauche de 1rem." },
        { name: ".flex-end", type: "alignement", description: "Pousse le contenu à droite via justify-content." },
        {
            name: "nb-card-header > *",
            type: "règle globale",
            description: "Donne 0.5rem de marge horizontale aux enfants directs d'un en-tête de carte Nebular.",
        },
        {
            name: ".gc-select-option",
            type: "combo",
            description: "Aligne une icône et un libellé dans un nb-option, avec un écart de 0.5rem.",
        },
    ];
}
