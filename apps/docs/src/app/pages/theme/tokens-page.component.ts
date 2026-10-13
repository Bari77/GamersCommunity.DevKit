import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";
import { Swatch } from "./swatch.model";

@Component({
    selector: "gcd-tokens-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    templateUrl: "./tokens-page.component.html",
    styleUrl: "./tokens-page.component.scss",
})
export class TokensPageComponent {
    protected readonly colors: Swatch[] = [
        { token: "--gc-accent", value: "#2ee6a6", preview: "#2ee6a6" },
        { token: "--gc-accent-2", value: "#3dd6ff", preview: "#3dd6ff" },
        { token: "--gc-surface-0", value: "#070b14", preview: "#070b14" },
        { token: "--gc-surface-1", value: "#0e1524", preview: "#0e1524" },
        { token: "--gc-surface-2", value: "#162033", preview: "#162033" },
        { token: "--gc-discriminator", value: "rgb(137 137 227)", preview: "rgb(137 137 227)" },
    ];

    protected readonly tokens: ApiRow[] = [
        { name: "--gc-accent", type: "couleur", default: "#2ee6a6", description: "Accent principal de la plateforme." },
        {
            name: "--gc-accent-2",
            type: "couleur",
            default: "#3dd6ff",
            description: "Accent secondaire, utilisé pour les liens et les dégradés.",
        },
        { name: "--gc-surface-0", type: "couleur", default: "#070b14", description: "Fond de page." },
        { name: "--gc-surface-1", type: "couleur", default: "#0e1524", description: "Fond des cartes et panneaux." },
        {
            name: "--gc-surface-2",
            type: "couleur",
            default: "#162033",
            description: "Fond des éléments posés sur une carte.",
        },
        {
            name: "--game-accent",
            type: "couleur",
            default: "var(--gc-accent)",
            description: "Accent du jeu courant, redéfini par chaque module.",
        },
        {
            name: "--gc-font-display",
            type: "police",
            default: '"Orbitron", sans-serif',
            description: "Police des titres et des éléments de marque.",
        },
        {
            name: "--gc-font-body",
            type: "police",
            default: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            description: "Police du texte courant.",
        },
        {
            name: "--gc-discriminator",
            type: "couleur",
            default: "rgb(137 137 227)",
            description: "Couleur du discriminant affiché après un pseudonyme.",
        },
        {
            name: "--gc-card-list-gap",
            type: "espacement",
            default: "0.5rem",
            description: "Écart entre deux cartes empilées en liste.",
        },
        {
            name: "--gc-card-grid-gap",
            type: "espacement",
            default: "1rem",
            description: "Écart entre deux cartes disposées en grille.",
        },
    ];

    protected readonly overrideSnippet = `:root {
    --game-accent: #f8b700;
}`;

    protected readonly usageSnippet = `.player-card {
    background: var(--gc-surface-1);
    border: 1px solid var(--gc-surface-2);
    gap: var(--gc-card-list-gap);
}

.player-card__name {
    font-family: var(--gc-font-display);
    color: var(--game-accent);
}`;
}
