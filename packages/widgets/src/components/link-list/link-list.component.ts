import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { gcLinkNetwork } from '../../link-networks';
import { linkLabel, linkNetwork } from '../../media';

export interface GcLink {
    id?: string;
    label?: string | null;
    url: string;
    /** Network key overriding the one guessed from the URL, or null to guess. */
    icon?: string | null;
}

@Component({
    selector: 'gc-link-list',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './link-list.component.html',
    styleUrl: './link-list.component.scss',
})
export class LinkListComponent {
    public readonly links = input<GcLink[]>([]);

    public readonly emptyLabel = input('No link yet.');

    /** In-place editor, same chrome as a presentation widget: draft, then save or cancel. */
    public readonly editing = input(false);

    public readonly addLabel = input('Add');

    public readonly saveLabel = input('Save');

    public readonly cancelLabel = input('Cancel');

    public readonly removeLabel = input('Remove');

    public readonly moveUpLabel = input('Move up');

    public readonly moveDownLabel = input('Move down');

    public readonly labelPlaceholder = input('Label');

    public readonly urlPlaceholder = input('https://…');

    public readonly linksChange = output<GcLink[]>();

    public readonly cancel = output<void>();

    protected readonly draft = signal<GcLink[]>([]);
    protected readonly draftLabel = signal('');
    protected readonly draftUrl = signal('');

    protected readonly canAdd = computed(() => this.draftUrl().trim().length > 0);

    protected readonly entries = computed(() =>
        this.links()
            .filter((link) => !!link?.url?.trim())
            .map((link) => {
                const url = link.url.trim();
                const key = link.icon?.trim() || linkNetwork(url);
                const network = gcLinkNetwork(key);

                return {
                    id: link.id ?? url,
                    url,
                    label: link.label?.trim() || linkLabel(url),
                    host: linkLabel(url),
                    network: network?.key ?? 'link',
                    color: network?.color ?? null,
                    path: network?.path ?? null,
                };
            }),
    );

    public constructor() {
        effect(() => {
            const editing = this.editing();
            untracked(() => {
                if (editing) {
                    this.draft.set(this.links().map((link) => ({ ...link })));
                    this.draftLabel.set('');
                    this.draftUrl.set('');
                }
            });
        });
    }

    protected inputValue(event: Event): string {
        return (event.target as HTMLInputElement).value;
    }

    protected add(event: Event): void {
        event.preventDefault();
        const url = this.draftUrl().trim();
        if (!url) {
            return;
        }

        const label = this.draftLabel().trim();
        this.draft.update((rows) => [...rows, { url, label: label || null }]);
        this.draftLabel.set('');
        this.draftUrl.set('');
    }

    protected editRow(index: number, key: 'label' | 'url', event: Event): void {
        const value = (event.target as HTMLInputElement).value.trim();
        this.draft.update((rows) =>
            rows.map((row, position) => (position === index ? { ...row, [key]: value } : row)),
        );
    }

    protected moveRow(index: number, offset: number): void {
        const target = index + offset;
        this.draft.update((rows) => {
            if (target < 0 || target >= rows.length) {
                return rows;
            }

            const next = [...rows];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }

    protected removeRow(index: number): void {
        this.draft.update((rows) => rows.filter((_, position) => position !== index));
    }

    protected commit(): void {
        this.linksChange.emit(this.draft().filter((row) => row.url.trim().length > 0));
    }
}
