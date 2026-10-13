import { ReleaseChange } from "./releases";

export interface Release {
    version: string;
    date: string;
    summary: string;
    changes: ReleaseChange[];
}
