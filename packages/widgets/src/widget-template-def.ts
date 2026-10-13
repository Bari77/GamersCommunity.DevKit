import { Signal, TemplateRef } from "@angular/core";
import { WidgetTemplateContext } from "./widget-template";

/** What the grid and the settings modal need from a `gcWidget` or `gcWidgetSettings` declaration. */
export interface WidgetTemplateDef {
    readonly type: Signal<string>;
    readonly template: TemplateRef<WidgetTemplateContext>;
    /** When true, the hover pencil edits the widget in place. The gear stays for instance params. */
    readonly editable?: Signal<boolean>;
}
