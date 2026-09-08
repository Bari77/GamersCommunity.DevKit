import { Directive, TemplateRef, inject, input } from '@angular/core';
import { WidgetInstance, WidgetSettings } from './workspace';

export interface WidgetTemplateContext {
    $implicit: WidgetSettings;
    instance: WidgetInstance;
}

/**
 * Declares how one widget *type* renders. The grid instantiates it once per placed
 * widget, so template order in the host has no effect and a type can appear twice.
 */
@Directive({
    selector: '[gcWidget]',
    standalone: true,
})
export class WidgetDefDirective {
    public readonly type = input.required<string>({ alias: 'gcWidget' });

    public readonly template = inject<TemplateRef<WidgetTemplateContext>>(TemplateRef);

    public static ngTemplateContextGuard(
        _directive: WidgetDefDirective,
        _context: unknown,
    ): _context is WidgetTemplateContext {
        return true;
    }
}
