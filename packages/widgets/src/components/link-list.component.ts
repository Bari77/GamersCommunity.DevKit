import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { gcLinkNetwork } from '../link-networks';
import { linkLabel, linkNetwork } from '../media';

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
    template: `
        @if (entries().length === 0) {
            <p class="gc-links__empty">{{ emptyLabel() }}</p>
        } @else {
            <ul class="gc-links">
                @for (entry of entries(); track entry.id) {
                    <li>
                        <a
                            class="gc-links__card"
                            [attr.data-network]="entry.network"
                            [style.--gc-link-color]="entry.color"
                            [href]="entry.url"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span class="gc-links__icon">
                                @if (entry.path) {
                                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path [attr.d]="entry.path" />
                                    </svg>
                                } @else {
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                }
                            </span>
                            <span class="gc-links__text">
                                <span class="gc-links__label">{{ entry.label }}</span>
                                <span class="gc-links__host">{{ entry.host }}</span>
                            </span>
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
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
                gap: 0.5rem;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .gc-links__card {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                height: 100%;
                padding: 0.55rem 0.7rem;
                border: 1px solid var(--gc-widget-border, rgba(255, 255, 255, 0.12));
                border-radius: 0.6rem;
                color: inherit;
                text-decoration: none;
                transition:
                    border-color 0.15s ease,
                    background 0.15s ease;
            }
            .gc-links__card:hover,
            .gc-links__card:focus-visible {
                border-color: var(--gc-link-color, var(--gc-widget-accent, #3366ff));
                background: color-mix(in srgb, var(--gc-link-color, #3366ff) 12%, transparent);
            }
            .gc-links__icon {
                display: flex;
                flex: 0 0 auto;
                color: var(--gc-link-color, currentColor);
            }
            .gc-links__icon svg {
                width: 1.35rem;
                height: 1.35rem;
            }
            /* The card is the click target, so the text must never widen it past its column. */
            .gc-links__text {
                display: flex;
                flex-direction: column;
                gap: 0.05rem;
                min-width: 0;
            }
            .gc-links__label {
                font-weight: 600;
                font-size: 0.9rem;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .gc-links__host {
                font-size: 0.72rem;
                opacity: 0.55;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
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
}
