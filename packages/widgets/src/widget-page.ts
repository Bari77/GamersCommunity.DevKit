import { WidgetInstance } from "./workspace";

export interface WidgetPage {
    id: string;
    title: string;
    icon?: string;
    /** Locked pages cannot be renamed nor removed by the owner. */
    locked?: boolean;
    /**
     * Audience allowed to open the page. The codes are the host's own, declared through
     * `pageVisibilityOptions`; undefined means the page is open to everyone. Hiding a page is the
     * host's job, on the server side: this only carries the owner's choice.
     */
    visibility?: string;
    widgets: WidgetInstance[];
}
