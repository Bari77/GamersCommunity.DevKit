import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Declares the content of one widget. The grid renders it wherever the layout
 * places the matching id, so template order in the host has no effect.
 */
@Directive({
    selector: '[gcWidget]',
    standalone: true,
})
export class WidgetDefDirective {
    public readonly id = input.required<string>({ alias: 'gcWidget' });

    public readonly label = input('', { alias: 'gcWidgetLabel' });

    public readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
