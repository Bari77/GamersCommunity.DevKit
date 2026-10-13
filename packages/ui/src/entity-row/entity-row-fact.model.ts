export interface EntityRowFact {
    label: string;
    /** Muted word printed before the value, as in "iLvl 650". */
    prefix?: string;
    /** Tints the badge with the row accent. */
    accent?: boolean;
}
