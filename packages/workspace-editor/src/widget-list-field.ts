import { WidgetTextField } from "./widget-contract.js";

export interface WidgetListField {
    key: string;
    label: string;
    type: "list";
    addLabel?: string;
    itemFields: WidgetTextField[];
}
