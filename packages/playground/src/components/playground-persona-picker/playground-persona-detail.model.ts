import { PlaygroundPersonaTag } from "./playground-persona-tag.model";

/** Labelled row of chips on a persona card (e.g. Guilds, Servers, Teams). `empty` shows when there are no tags. */
export interface PlaygroundPersonaDetail {
    label: string;
    tags: PlaygroundPersonaTag[];
    empty?: string;
}
