import { WidgetInstance, WidgetSettings } from "./workspace";

export interface WidgetTemplateContext {
    $implicit: WidgetSettings;
    instance: WidgetInstance;
    /** True when the owner opened in-place data editing for this instance. */
    editingData?: boolean;
    /** Leaves in-place data editing for this instance. */
    stopDataEdit?: () => void;
    /** Writes widget-carried settings from an in-place editor (lists stored on the instance). */
    updateSettings?: (settings: WidgetSettings) => void;
}
