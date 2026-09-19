import { Signal, TemplateRef } from '@angular/core';
import { WidgetInstance, WidgetSettings } from './workspace';

export interface WidgetTemplateContext {
    $implicit: WidgetSettings;
    instance: WidgetInstance;
    /** True when the owner opened in-place data editing for this instance. */
    editingData?: boolean;
    /** Leaves in-place data editing for this instance. */
    stopDataEdit?: () => void;
}

/** What the grid and the settings panel need from a `gcWidget` or `gcWidgetSettings` declaration. */
export interface WidgetTemplateDef {
    readonly type: Signal<string>;
    readonly template: TemplateRef<WidgetTemplateContext>;
    /** When true, the hover pencil edits the widget in place instead of opening the settings panel. */
    readonly editable?: Signal<boolean>;
}
