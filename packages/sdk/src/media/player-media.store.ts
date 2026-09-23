import { computed, inject, Injectable, resource, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ResourceUtils } from "../utils/resource.utils";
import type {
  PlayerMediaCreateRequestDto,
  PlayerMediaKind,
  PlayerMediaUpdateRequestDto,
} from "./player-media.dto";
import { PlayerMedia } from "./player-media.model";
import { PlayerMediaService } from "./player-media.service";

interface MediaParams {
  kind: PlayerMediaKind;
  playerPublicId: string;
}

/** One instance per media widget: a page can host a photo and a video gallery at once. */
@Injectable()
export class PlayerMediaStore {
  public readonly items = resource({
    params: () => this.params(),
    loader: ({ params }) => firstValueFrom(this.service.list(params.kind, params.playerPublicId)),
    defaultValue: [] as PlayerMedia[],
  });

  public readonly loading = computed(() => ResourceUtils.isPending(this.items));
  public readonly saving = signal(false);
  public readonly errorCode = signal<string | null>(null);

  private readonly params = signal<MediaParams | undefined>(undefined);
  private readonly service = inject(PlayerMediaService);

  public setContext(kind: PlayerMediaKind, playerPublicId: string): void {
    this.params.set({ kind, playerPublicId });
  }

  public clearError(): void {
    this.errorCode.set(null);
  }

  public create(data: PlayerMediaCreateRequestDto): Promise<boolean> {
    const params = this.params();
    return params ? this.run(() => firstValueFrom(this.service.create(params.kind, data))) : Promise.resolve(false);
  }

  public remove(publicId: string): Promise<boolean> {
    const params = this.params();
    return params
      ? this.run(() => firstValueFrom(this.service.remove(params.kind, publicId)))
      : Promise.resolve(false);
  }

  public update(publicId: string, data: PlayerMediaUpdateRequestDto): Promise<boolean> {
    const params = this.params();
    return params
      ? this.run(() => firstValueFrom(this.service.update(params.kind, publicId, data)))
      : Promise.resolve(false);
  }

  public toggleShare(item: PlayerMedia): Promise<boolean> {
    return this.update(item.publicId, { share: !item.share });
  }

  private async run(action: () => Promise<unknown>): Promise<boolean> {
    this.saving.set(true);
    this.errorCode.set(null);
    try {
      await action();
      this.items.reload();
      return true;
    } catch (err: unknown) {
      this.errorCode.set((err as { error?: { Code?: string } })?.error?.Code ?? "UNKNOWN");
      return false;
    } finally {
      this.saving.set(false);
    }
  }
}
