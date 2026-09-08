import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { linkLabel, linkNetwork } from '../media';

export interface GcLink {
    label?: string | null;
    url: string;
}

@Component({
    selector: 'gc-link-list',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (entries().length === 0) {
            <p class="gc-links__empty">{{ emptyLabel() }}</p>
        } @else {
            <ul class="gc-links">
                @for (entry of entries(); track entry.url) {
                    <li>
                        <a
                            class="gc-links__item"
                            [attr.data-network]="entry.network"
                            [href]="entry.url"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span class="gc-links__label">{{ entry.label }}</span>
                            <span class="gc-links__host">{{ entry.host }}</span>
                        </a>
                    </li>
                }
            </ul>
        }
    `,
    styles: [
        `
            :host {
                display: block;
            }
            .gc-links {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .gc-links__item {
                display: flex;
                flex-direction: column;
                gap: 0.1rem;
                padding: 0.5rem 0.85rem;
                border: 1px solid var(--gc-widget-border, rgba(255, 255, 255, 0.12));
                border-radius: 0.5rem;
                color: inherit;
                text-decoration: none;
            }
            .gc-links__item:hover {
                border-color: var(--gc-widget-accent, #3366ff);
            }
            .gc-links__label {
                font-weight: 600;
                font-size: 0.9rem;
            }
            .gc-links__host {
                font-size: 0.72rem;
                opacity: 0.55;
            }
            .gc-links__empty {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.6;
            }
        `,
    ],
})
export class LinkListComponent {
    public readonly links = input<GcLink[]>([]);

    public readonly emptyLabel = input('No link yet.');

    protected readonly entries = computed(() =>
        this.links()
            .filter((link) => !!link?.url?.trim())
            .map((link) => ({
                url: link.url.trim(),
                label: link.label?.trim() || linkLabel(link.url),
                host: linkLabel(link.url),
                network: linkNetwork(link.url),
            })),
    );
}
