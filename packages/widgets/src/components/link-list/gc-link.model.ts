export interface GcLink {
    id?: string;
    label?: string | null;
    url: string;
    /** Network key overriding the one guessed from the URL, or null to guess. */
    icon?: string | null;
}
