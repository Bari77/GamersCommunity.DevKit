import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { WidgetCatalog } from './catalog';

/** Lists the widget types the owner can drop on the current page. */
@Component({
    selector: 'gc-widget-picker',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './widget-picker.component.html',
    styleUrl: './widget-picker.component.scss',
})
export class WidgetPickerComponent {
    public readonly catalog = input.required<WidgetCatalog>();

    /** Types already placed; `unique` entries with a match are offered as disabled. */
    public readonly usedTypes = input<readonly string[]>([]);

    public readonly title = input('Add a widget');

    public readonly emptyLabel = input('No widget available.');

    public readonly usedLabel = input('Already used');

    public readonly closeLabel = input('Close');

    public readonly pick = output<string>();

    public readonly close = output<void>();

    protected readonly entries = computed(() => {
        const used = new Set(this.usedTypes());
        return this.catalog().map((entry) => ({
            type: entry.type,
            label: entry.label,
            description: entry.description,
            used: entry.unique === true && used.has(entry.type),
        }));
    });
}
