import { WidgetTextField } from "./catalog";

/** Repeats `itemFields` so a widget can hold an arbitrary number of entries. */
export interface WidgetListField {
    key: string;
    label: string;
    type: "list";
    addLabel?: string;
    itemFields: WidgetTextField[];
}
