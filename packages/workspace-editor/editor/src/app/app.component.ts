import { NgComponentOutlet } from '@angular/common';
import { Component, OnInit, signal, Type } from '@angular/core';
import {
    serializeWorkspace,
    WidgetCatalog,
    WidgetPageVisibilityOption,
    WidgetWorkspace,
    WidgetWorkspaceComponent,
} from '@bari77/gc-widgets';
import { gameWorkspaceRegistry } from 'virtual:game-editor-registry';
import type { WorkspaceConfigResponse } from './workspace-config.types';

@Component({
    selector: 'gc-workspace-editor-root',
    standalone: true,
    imports: [NgComponentOutlet, WidgetWorkspaceComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    public readonly catalog = signal<WidgetCatalog>([]);
    public readonly columns = signal(12);
    public readonly rowHeight = signal(90);
    public readonly workspace = signal<WidgetWorkspace | null>(null);
    public readonly layoutPath = signal('');
    public readonly editing = signal(true);
    public readonly saving = signal(false);
    public readonly error = signal<string | null>(null);
    public readonly templateHost = signal<Type<unknown> | null>(null);

    /** Declared by the game registry, so the editor offers the same audiences as the live page. */
    public readonly pageVisibilityOptions = signal<WidgetPageVisibilityOption[]>([]);

    private readonly apiUrl = import.meta.env.GC_API_URL as string;

    public async ngOnInit(): Promise<void> {
        try {
            const config = await fetch(`${this.apiUrl}/api/config`).then((response) => {
                if (!response.ok) {
                    throw new Error(`Config request failed (${response.status}).`);
                }
                return response.json() as Promise<WorkspaceConfigResponse>;
            });

            this.catalog.set(config.catalog);
            this.columns.set(config.columns);
            this.rowHeight.set(config.rowHeight);
            this.workspace.set(config.layout);
            this.layoutPath.set(config.layoutPath);
            this.pageVisibilityOptions.set(gameWorkspaceRegistry.pageVisibilityOptions ?? []);

            if (gameWorkspaceRegistry.loadTemplateHost) {
                const host = await gameWorkspaceRegistry.loadTemplateHost();
                this.templateHost.set(host as Type<unknown>);
            }
        } catch (loadError) {
            this.error.set(loadError instanceof Error ? loadError.message : String(loadError));
        }
    }

    public async onSave(next: WidgetWorkspace): Promise<void> {
        this.saving.set(true);
        this.error.set(null);

        try {
            const response = await fetch(`${this.apiUrl}/api/layout`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: serializeWorkspace(next),
            });

            if (!response.ok) {
                const body = (await response.json()) as { issues?: { path: string; message: string }[]; error?: string };
                if (body.issues?.length) {
                    throw new Error(body.issues.map((row) => `${row.path}: ${row.message}`).join('\n'));
                }
                throw new Error(body.error ?? `Save failed (${response.status}).`);
            }

            this.workspace.set(next);
            this.editing.set(false);
        } catch (saveError) {
            this.error.set(saveError instanceof Error ? saveError.message : String(saveError));
        } finally {
            this.saving.set(false);
        }
    }
}
