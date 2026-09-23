import { inject, Injectable, Injector, runInInjectionContext } from "@angular/core";
import type { PlayerMediaKind } from "./player-media.dto";
import { PlayerMediaStore } from "./player-media.store";

/**
 * Media belongs to the player, not to a widget: the gallery in the grid and the management
 * panel behind its gear are two components that must read and refresh the same list.
 * Provide this on the page hosting them.
 */
@Injectable()
export class PlayerMediaStores {
  private readonly injector = inject(Injector);

  private readonly stores: Record<PlayerMediaKind, PlayerMediaStore> = {
    photo: this.create(),
    video: this.create(),
    stream: this.create(),
  };

  public for(kind: PlayerMediaKind): PlayerMediaStore {
    return this.stores[kind];
  }

  private create(): PlayerMediaStore {
    return runInInjectionContext(this.injector, () => new PlayerMediaStore());
  }
}
