import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-motion-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent],
    templateUrl: "./motion-page.component.html",
    styleUrl: "./motion-page.component.scss",
})
export class MotionPageComponent {
    protected readonly visible = signal(true);

    protected readonly enterHtml = `<div class="gc-enter">Sans délai</div>
<div class="gc-enter gc-enter-delay-1">Délai 1</div>
<div class="gc-enter gc-enter-delay-2">Délai 2</div>
<div class="gc-enter gc-enter-delay-3">Délai 3</div>`;

    protected readonly pulseHtml = `<span class="badge gc-pulse-new">Nouveau</span>`;

    protected readonly keyframesSnippet = `.player-card--highlighted {
    animation: gc-fade-up 0.55s ease both;
}

.player-card--live {
    animation: gc-pulse-accent 2s ease-in-out infinite;
}`;

    protected readonly classes: ApiRow[] = [
        {
            name: ".gc-enter",
            type: "animation",
            description: "Fondu montant de 0.55s, avec fill-mode both : l'élément est masqué avant de démarrer.",
        },
        { name: ".gc-enter-delay-1", type: "délai", description: "Retarde le départ de 0.08s." },
        { name: ".gc-enter-delay-2", type: "délai", description: "Retarde le départ de 0.16s." },
        { name: ".gc-enter-delay-3", type: "délai", description: "Retarde le départ de 0.24s." },
        {
            name: ".gc-pulse-new",
            type: "animation",
            description: "Halo pulsé en boucle de 2s, teinté par --game-accent.",
        },
        {
            name: "gc-fade-up",
            type: "keyframes",
            description: "Passe d'une opacité nulle et d'un décalage d'1rem vers la position finale.",
        },
        {
            name: "gc-pulse-accent",
            type: "keyframes",
            description: "Fait croître puis disparaître une ombre portée colorée autour de l'élément.",
        },
    ];

    protected replay(): void {
        this.visible.set(false);
        setTimeout(() => this.visible.set(true), 60);
    }
}
