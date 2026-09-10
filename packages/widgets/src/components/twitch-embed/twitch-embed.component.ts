import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { twitchChannel, twitchPlayerUrl } from '../../media';

@Component({
    selector: 'gc-twitch-embed',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './twitch-embed.component.html',
    styleUrl: './twitch-embed.component.scss',
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
