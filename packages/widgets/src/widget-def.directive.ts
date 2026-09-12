import { Directive, TemplateRef, inject, input } from '@angular/core';
import { registerWidgetTemplateDef } from './widget-def.registry';
import { WidgetTemplateContext } from './widget-template';

/**
 * Declares how one widget *type* renders. The grid instantiates it once per placed
 * widget, so template order in the host has no effect and a type can appear twice.
 */
@Directive({
    selector: '[gcWidget]',
    standalone: true,
})
export class WidgetDefDirective {
    /**
     * Left optional on purpose: a template registers itself the moment it is created, which is
     * one render pass before Angular evaluates a `[gcWidget]` expression. A def still waiting
     * for its type matches no widget instead of throwing while the grid looks through the list.
     */
    public readonly type = input('', { alias: 'gcWidget' });

    public readonly template = inject<TemplateRef<WidgetTemplateContext>>(TemplateRef);

    public constructor() {
        registerWidgetTemplateDef(this, 'widget');
    }

    public static ngTemplateContextGuard(
        _directive: WidgetDefDirective,
        _context: unknown,
    ): _context is WidgetTemplateContext {
        return true;
    }
}
