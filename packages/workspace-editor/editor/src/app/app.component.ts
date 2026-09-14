import { NgComponentOutlet } from '@angular/common';
import { Component, computed, OnInit, signal, Type } from '@angular/core';
import {
    serializeWorkspace,
    WidgetCatalog,
    WidgetPageVisibilityOption,
    WidgetSelectComponent,
    WidgetSelectOption,
    WidgetWorkspace,
    WidgetWorkspaceComponent,
} from '@bari77/gc-widgets';
import { gameWorkspaceRegistries } from 'virtual:game-editor-registry';
import type { WorkspaceConfigResponse, WorkspaceLayoutEntry, WorkspaceLayoutsResponse } from './workspace-config.types';

type GameRegistry = Awaited<ReturnType<(typeof gameWorkspaceRegistries)[string]>>;

@Component({
    selector: 'gc-workspace-editor-root',
    standalone: true,
    imports: [NgComponentOutlet, WidgetSelectComponent, WidgetWorkspaceComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    public readonly catalog = signal<WidgetCatalog>([]);
    public readonly columns = signal(12);
    public readonly rowHeight = signal(90);
    public readonly workspace = signal<WidgetWorkspace | null>(null);
    public readonly editing = signal(true);
    public readonly saving = signal(false);
    public readonly loading = signal(true);
    public readonly error = signal<string | null>(null);
    public readonly templateHost = signal<Type<unknown> | null>(null);

    /** Every layout JSON the CLI scanned, whatever the target it belongs to. */
    public readonly entries = signal<WorkspaceLayoutEntry[]>([]);
    public readonly currentId = signal('');

    /** Declared by the game registry, so the editor offers the same audiences as the live page. */
    public readonly pageVisibilityOptions = signal<WidgetPageVisibilityOption[]>([]);

    public readonly options = computed<WidgetSelectOption[]>(() =>
        this.entries().map((entry) => ({
            value: entry.id,
            label: entry.isDefault ? entry.label : `${entry.label} · ${entry.file.replace(/\.json$/, '')}`,
            hint: entry.layout,
        })),
    );

    private readonly apiUrl = import.meta.env.GC_API_URL;
    private readonly registries = new Map<string, Promise<GameRegistry>>();

    /** Guards against a slow response from a layout the user already switched away from. */
    private request = 0;

    public async ngOnInit(): Promise<void> {
        try {
            const { entries } = await this.get<WorkspaceLayoutsResponse>('/api/layouts');
            this.entries.set(entries);

            const started =
                entries.find(
                    (entry) =>
                        entry.target === import.meta.env.GC_START_TARGET &&
                        entry.layout === import.meta.env.GC_START_LAYOUT,
                ) ?? entries[0];

            if (!started) {
                throw new Error('No layout JSON found under config/.');
            }

            await this.open(started.id);
        } catch (loadError) {
            this.loading.set(false);
            this.error.set(this.messageOf(loadError));
        }
    }

    public async open(id: string): Promise<void> {
        const entry = this.entries().find((row) => row.id === id);
        if (!entry) {
            return;
        }

        const request = ++this.request;
        this.currentId.set(id);
        this.loading.set(true);
        this.error.set(null);

        try {
            const query = `target=${encodeURIComponent(entry.target)}&layout=${encodeURIComponent(entry.layout)}`;
            const config = await this.get<WorkspaceConfigResponse>(`/api/config?${query}`);
            const registry = await this.registryFor(entry.target);
            const host = ((await registry?.loadTemplateHost?.()) as Type<unknown> | undefined) ?? null;

            if (request !== this.request) {
                return;
            }

            this.catalog.set(config.catalog);
            this.columns.set(config.columns);
            this.rowHeight.set(config.rowHeight);
            this.workspace.set(config.layout);
            this.pageVisibilityOptions.set(registry?.pageVisibilityOptions ?? []);
            this.templateHost.set(host);
            this.editing.set(true);
        } catch (loadError) {
            if (request === this.request) {
                this.workspace.set(null);
                this.error.set(this.messageOf(loadError));
            }
        } finally {
            if (request === this.request) {
                this.loading.set(false);
            }
        }
    }

    public async onSave(next: WidgetWorkspace): Promise<void> {
        const entry = this.entries().find((row) => row.id === this.currentId());
        if (!entry) {
            return;
        }

        this.saving.set(true);
        this.error.set(null);

        try {
            const query = `target=${encodeURIComponent(entry.target)}&layout=${encodeURIComponent(entry.layout)}`;
            const response = await fetch(`${this.apiUrl}/api/layout?${query}`, {
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
            this.error.set(this.messageOf(saveError));
        } finally {
            this.saving.set(false);
        }
    }

    private async get<T>(path: string): Promise<T> {
        const response = await fetch(`${this.apiUrl}${path}`);

        if (!response.ok) {
            const body = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(body?.error ?? `${path} failed (${response.status}).`);
        }

        return (await response.json()) as T;
    }

    private registryFor(target: string): Promise<GameRegistry> | undefined {
        const load = gameWorkspaceRegistries[target];
        if (!load) {
            return undefined;
        }

        const cached = this.registries.get(target) ?? load();
        this.registries.set(target, cached);
        return cached;
    }

    private messageOf(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
