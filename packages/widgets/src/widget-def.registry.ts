import { DestroyRef, Injectable, Signal, inject, signal } from '@angular/core';
import { WidgetTemplateDef } from './widget-template';

/**
 * Collects the widget templates of one workspace through dependency injection.
 *
 * A content query cannot see an `ng-template` that lives in the view of a projected
 * component, which is exactly how a host groups the templates it shares between the
 * game page and the workspace editor. Registering through the injector works in both
 * cases, because a projected component sits under the workspace in the element
 * injector tree whether it is written inline or created by `ngComponentOutlet`.
 */
@Injectable()
export class WidgetDefRegistry {
    private readonly widgets = signal<readonly WidgetTemplateDef[]>([]);
    private readonly settings = signal<readonly WidgetTemplateDef[]>([]);

    public readonly widgetDefs: Signal<readonly WidgetTemplateDef[]> = this.widgets.asReadonly();
    public readonly settingsDefs: Signal<readonly WidgetTemplateDef[]> = this.settings.asReadonly();

    public registerWidget(def: WidgetTemplateDef): void {
        this.widgets.update((current) => [...current, def]);
    }

    public unregisterWidget(def: WidgetTemplateDef): void {
        this.widgets.update((current) => current.filter((item) => item !== def));
    }

    public registerSettings(def: WidgetTemplateDef): void {
        this.settings.update((current) => [...current, def]);
    }

    public unregisterSettings(def: WidgetTemplateDef): void {
        this.settings.update((current) => current.filter((item) => item !== def));
    }
}

/**
 * Ties a template declaration to the enclosing workspace, for its whole lifetime.
 *
 * Must be called from an injection context. A template declared outside any workspace
 * finds no registry and simply stays unregistered, which keeps `gc-widget-grid` usable
 * on its own with its own content query.
 */
export function registerWidgetTemplateDef(def: WidgetTemplateDef, kind: 'widget' | 'settings'): void {
    const registry = inject(WidgetDefRegistry, { optional: true });
    if (!registry) {
        return;
    }

    if (kind === 'widget') {
        registry.registerWidget(def);
        inject(DestroyRef).onDestroy(() => registry.unregisterWidget(def));
        return;
    }

    registry.registerSettings(def);
    inject(DestroyRef).onDestroy(() => registry.unregisterSettings(def));
}
