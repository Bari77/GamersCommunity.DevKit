import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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
