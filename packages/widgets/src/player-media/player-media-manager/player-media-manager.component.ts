import { Component, computed, effect, inject, input } from "@angular/core";
import { PlayerMediaKind, PlayerMediaStores } from "@bari77/gc-sdk";
import { SkeletonComponent } from "@bari77/gc-ui";
import { MediaGalleryComponent } from "../../components/media-gallery/media-gallery.component";
import { TwitchEmbedComponent } from "../../components/twitch-embed/twitch-embed.component";
import {
  DEFAULT_PLAYER_MEDIA_MANAGER_LABELS,
  type PlayerMediaManagerLabels,
} from "../labels";

@Component({
  standalone: true,
  selector: "gc-player-media-manager",
  imports: [MediaGalleryComponent, SkeletonComponent, TwitchEmbedComponent],
  templateUrl: "./player-media-manager.component.html",
  styleUrl: "./player-media-manager.component.scss",
})
export class PlayerMediaManagerComponent {
  public readonly playerPublicId = input.required<string>();
  public readonly kind = input.required<PlayerMediaKind>();
  public readonly labels = input<Partial<PlayerMediaManagerLabels>>({});

  public readonly store = computed(() => this.stores.for(this.kind()));
  public readonly items = computed(() => this.store().items.value());
  public readonly galleryItems = computed(() => this.items().map((item) => item.galleryItem));
  public readonly resolvedLabels = computed(() => ({
    ...DEFAULT_PLAYER_MEDIA_MANAGER_LABELS,
    ...this.labels(),
  }));
  public readonly emptyLabel = computed(() => {
    const labels = this.resolvedLabels();
    switch (this.kind()) {
      case "photo":
        return labels.emptyPhoto;
      case "video":
        return labels.emptyVideo;
      case "stream":
        return labels.emptyStream;
    }
  });

  protected readonly galleryPlaceholders = [0, 1, 2, 3, 4, 5];

  private readonly stores = inject(PlayerMediaStores);

  public constructor() {
    effect(() => this.store().setContext(this.kind(), this.playerPublicId()));
  }
}
