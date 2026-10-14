import { PlaygroundPersonaDetail } from "./playground-persona-detail.model";
import { PlaygroundPersonaStat } from "./playground-persona-stat.model";

/** What a developer reads before signing in as a mock persona. Built by each game from its catalog. */
export interface PlaygroundPersonaCard {
    id: string;
    nickname: string;
    discriminator: string;
    avatarUrl: string;
    headline?: string | null;
    stats?: PlaygroundPersonaStat[];
    details?: PlaygroundPersonaDetail[];
}
