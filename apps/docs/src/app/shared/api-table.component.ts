import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ApiRow {
    name: string;
    type: string;
    default?: string;
    description: string;
}

@Component({
    selector: 'gcd-api',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './api-table.component.html',
    styleUrl: './api-table.component.scss',
})
export class ApiTableComponent {
    public readonly heading = input('');

    public readonly rows = input.required<ApiRow[]>();

    /** Outputs and helpers have no default value worth a column. */
    public readonly showDefault = input(true);
}
