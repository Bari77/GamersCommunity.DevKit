import { Directive, TemplateRef, inject, input } from '@angular/core';
import { WidgetTemplateContext } from './widget-def.directive';

/**
 * Extra settings UI for one widget *type*, rendered inside the gear panel below the
 * schema-driven fields. Widgets whose content lives in the host's backend declare their
 * data management here, which keeps the widget body itself identical for every visitor.
 */
@Directive({
    selector: '[gcWidgetSettings]',
    standalone: true,
})
export class WidgetSettingsDefDirective {
    public readonly type = input.required<string>({ alias: 'gcWidgetSettings' });

    public readonly template = inject<TemplateRef<WidgetTemplateContext>>(TemplateRef);

    public static ngTemplateContextGuard(
        _directive: WidgetSettingsDefDirective,
        _context: unknown,
    ): _context is WidgetTemplateContext {
        return true;
    }
}
