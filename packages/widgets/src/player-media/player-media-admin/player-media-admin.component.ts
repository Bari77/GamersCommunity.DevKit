import { Component, computed, effect, inject, input, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  PlayerMedia,
  PlayerMediaKind,
  PlayerMediaStores,
} from "@bari77/gc-sdk";
import { NbButtonModule, NbCheckboxModule, NbInputModule } from "@nebular/theme";
import {
  DEFAULT_PLAYER_MEDIA_ADMIN_LABELS,
  type PlayerMediaAdminLabels,
} from "../labels";

@Component({
  standalone: true,
  selector: "gc-player-media-admin",
  imports: [FormsModule, NbButtonModule, NbCheckboxModule, NbInputModule],
  templateUrl: "./player-media-admin.component.html",
  styleUrl: "./player-media-admin.component.scss",
})
export class PlayerMediaAdminComponent {
  public readonly playerPublicId = input.required<string>();
  public readonly kind = input.required<PlayerMediaKind>();
  public readonly labels = input<Partial<PlayerMediaAdminLabels>>({});

  public readonly url = signal("");
  public readonly caption = signal("");
  public readonly share = signal(true);

  public readonly store = computed(() => this.stores.for(this.kind()));
  public readonly items = computed(() => this.store().items.value());
  public readonly resolvedLabels = computed(() => ({
    ...DEFAULT_PLAYER_MEDIA_ADMIN_LABELS,
    ...this.labels(),
  }));
  public readonly urlPlaceholder = computed(() => {
    const labels = this.resolvedLabels();
    switch (this.kind()) {
      case "photo":
        return labels.urlPlaceholderPhoto;
      case "video":
        return labels.urlPlaceholderVideo;
      case "stream":
        return labels.urlPlaceholderStream;
    }
  });
  public readonly canAdd = computed(() => !this.store().saving() && this.url().trim().length > 0);

  private readonly stores = inject(PlayerMediaStores);

  public constructor() {
    effect(() => this.store().setContext(this.kind(), this.playerPublicId()));
  }

  public async add(): Promise<void> {
    if (!this.canAdd()) {
      return;
    }

    const created = await this.store().create({
      url: this.url().trim(),
      caption: this.caption().trim() || null,
      share: this.share(),
    });

    if (created) {
      this.url.set("");
      this.caption.set("");
    }
  }

  public editUrl(item: PlayerMedia, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (value && value !== item.url) {
      this.store().update(item.publicId, { url: value });
    }
  }

  public editCaption(item: PlayerMedia, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (value !== (item.caption ?? "")) {
      this.store().update(item.publicId, { caption: value || null });
    }
  }
}
