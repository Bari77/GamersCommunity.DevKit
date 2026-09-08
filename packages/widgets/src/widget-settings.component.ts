import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WidgetCatalogEntry, WidgetListField, WidgetSettingsField, WidgetTextField } from './catalog';
import { WidgetSettings } from './workspace';

type SettingsRow = Record<string, unknown>;

/** Renders the settings form described by a catalog entry, so hosts declare data, not UI. */
@Component({
    selector: 'gc-widget-settings',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './widget-settings.component.html',
    styleUrl: './widget-settings.component.scss',
})
export class WidgetSettingsComponent {
    public readonly entry = input.required<WidgetCatalogEntry>();

    public readonly settings = input.required<WidgetSettings>();

    public readonly closeLabel = input('Close');

    public readonly addRowLabel = input('Add');

    public readonly removeRowLabel = input('Remove');

    public readonly settingsChange = output<WidgetSettings>();

    public readonly close = output<void>();

    protected asList(field: WidgetSettingsField): WidgetListField {
        return field as WidgetListField;
    }

    protected asText(field: WidgetSettingsField): WidgetTextField {
        return field as WidgetTextField;
    }

    protected value(key: string): string {
        const raw = this.settings()[key];
        return raw === null || raw === undefined ? '' : String(raw);
    }

    protected rows(key: string): SettingsRow[] {
        const raw = this.settings()[key];
        return Array.isArray(raw) ? (raw as SettingsRow[]) : [];
    }

    protected rowValue(row: SettingsRow, key: string): string {
        const raw = row[key];
        return raw === null || raw === undefined ? '' : String(raw);
    }

    protected setValue(key: string, event: Event): void {
        const input = event.target as HTMLInputElement | HTMLTextAreaElement;
        this.settingsChange.emit({ ...this.settings(), [key]: input.value });
    }

    protected setRowValue(listKey: string, index: number, key: string, event: Event): void {
        const input = event.target as HTMLInputElement;
        const rows = this.rows(listKey).map((row, position) =>
            position === index ? { ...row, [key]: input.value } : row,
        );
        this.settingsChange.emit({ ...this.settings(), [listKey]: rows });
    }

    protected addRow(listKey: string): void {
        this.settingsChange.emit({ ...this.settings(), [listKey]: [...this.rows(listKey), {}] });
    }

    protected removeRow(listKey: string, index: number): void {
        const rows = this.rows(listKey).filter((_, position) => position !== index);
        this.settingsChange.emit({ ...this.settings(), [listKey]: rows });
    }
}
