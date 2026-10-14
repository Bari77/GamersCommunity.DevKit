import { Component, computed, input, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule } from "@nebular/theme";
import { PlaygroundPersonaCard } from "./playground-persona-card.model";
import { PlaygroundPersonaPickerLabels } from "./playground-persona-picker-labels.model";

export const DEFAULT_PLAYGROUND_PERSONA_PICKER_LABELS: PlaygroundPersonaPickerLabels = {
    title: "Playground session",
    switchTitle: "Switch account",
    description:
        "Choose which mock persona Authentik signs you in as. Each card shows the data that persona carries, " +
        "so you can pick the one that fits the test. The page reloads so MSW handlers pick up the new session.",
    search: "Find a persona",
    searchPlaceholder: "Name, guild, server…",
    personas: "personas",
    current: "Current",
    use: "Sign in",
    empty: "No persona matches.",
    back: "Back to the game",
};

/**
 * Playground persona picker (stand-in for /users/login). Pure view: the game maps its mock catalog
 * to {@link PlaygroundPersonaCard}s and handles `pick` (persist + reload).
 */
@Component({
    standalone: true,
    selector: "gc-playground-persona-picker",
    imports: [FormsModule, RouterLink, NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule],
    templateUrl: "./playground-persona-picker.component.html",
    styleUrl: "./playground-persona-picker.component.scss",
})
export class PlaygroundPersonaPickerComponent {
    public readonly personas = input.required<PlaygroundPersonaCard[]>();
    public readonly activeId = input<string | null>(null);
    /** Embedded in another card (e.g. profile): no page chrome, no back link. */
    public readonly embedded = input(false);
    public readonly homeLink = input<string | null>(null);
    public readonly labels = input<Partial<PlaygroundPersonaPickerLabels>>({});

    public readonly pick = output<string>();

    protected readonly query = signal("");
    protected readonly text = computed<PlaygroundPersonaPickerLabels>(() => ({
        ...DEFAULT_PLAYGROUND_PERSONA_PICKER_LABELS,
        ...this.labels(),
    }));

    protected readonly visible = computed<PlaygroundPersonaCard[]>(() => {
        const term = this.query().trim().toLowerCase();
        const activeId = this.activeId();
        const matches = term ? this.personas().filter((card) => haystack(card).includes(term)) : this.personas();
        return [...matches].sort((left, right) => Number(right.id === activeId) - Number(left.id === activeId));
    });

    protected choose(card: PlaygroundPersonaCard): void {
        if (card.id !== this.activeId()) {
            this.pick.emit(card.id);
        }
    }
}

function haystack(card: PlaygroundPersonaCard): string {
    const parts = [card.nickname, card.discriminator, card.headline ?? ""];
    for (const stat of card.stats ?? []) {
        parts.push(`${stat.value} ${stat.label}`);
    }
    for (const detail of card.details ?? []) {
        parts.push(detail.label, detail.tags.length ? "" : (detail.empty ?? ""));
        for (const tag of detail.tags) {
            parts.push(tag.text, tag.hint ?? "");
        }
    }
    return parts.join(" ").toLowerCase();
}
