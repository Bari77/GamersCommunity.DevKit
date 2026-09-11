import { Signal, TemplateRef } from '@angular/core';
import { WidgetInstance, WidgetSettings } from './workspace';

export interface WidgetTemplateContext {
    $implicit: WidgetSettings;
    instance: WidgetInstance;
}

/** What the grid and the settings panel need from a `gcWidget` or `gcWidgetSettings` declaration. */
export interface WidgetTemplateDef {
    readonly type: Signal<string>;
    readonly template: TemplateRef<WidgetTemplateContext>;
}
