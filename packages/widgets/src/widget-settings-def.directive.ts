import { Directive, TemplateRef, inject, input } from '@angular/core';
import { registerWidgetTemplateDef } from './widget-def.registry';
import { WidgetTemplateContext } from './widget-template';

/**
 * Extra settings UI for one widget *type*, rendered inside the gear modal below the
 * schema-driven fields. Only instance parameters belong here (title is already provided).
 * Content that lives in the host's backend is edited in the widget via `gcWidgetEditable`.
 */
@Directive({
    selector: '[gcWidgetSettings]',
    standalone: true,
})
export class WidgetSettingsDefDirective {
    /** Optional for the same reason as `gcWidget`: registration happens before the binding lands. */
    public readonly type = input('', { alias: 'gcWidgetSettings' });

    public readonly template = inject<TemplateRef<WidgetTemplateContext>>(TemplateRef);

    public constructor() {
        registerWidgetTemplateDef(this, 'settings');
    }

    public static ngTemplateContextGuard(
        _directive: WidgetSettingsDefDirective,
        _context: unknown,
    ): _context is WidgetTemplateContext {
        return true;
    }
}
