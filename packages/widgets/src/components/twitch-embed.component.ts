import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { twitchChannel, twitchPlayerUrl } from '../media';

@Component({
    selector: 'gc-twitch-embed',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (playerUrl(); as url) {
            <iframe
                class="gc-twitch__frame"
                [src]="url"
                [title]="channel()"
                allowfullscreen
                referrerpolicy="strict-origin"
            ></iframe>
        } @else {
            <p class="gc-twitch__empty">{{ emptyLabel() }}</p>
        }
    `,
    styles: [
        `
            :host {
                display: block;
                height: 100%;
            }
            .gc-twitch__frame {
                display: block;
                width: 100%;
                height: 100%;
                min-height: 12rem;
                border: 0;
                border-radius: 0.5rem;
                background: #000;
            }
            .gc-twitch__empty {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.6;
            }
        `,
    ],
})
export class TwitchEmbedComponent {
    /** Channel name or any twitch.tv URL. */
    public readonly channel = input('');

    public readonly emptyLabel = input('Add a Twitch channel to display the player.');

    private readonly sanitizer = inject(DomSanitizer);

    protected readonly playerUrl = computed<SafeResourceUrl | null>(() => {
        const name = twitchChannel(this.channel());
        return name ? this.sanitizer.bypassSecurityTrustResourceUrl(twitchPlayerUrl(name)) : null;
    });
}
