import { makeEnvironmentProviders, type EnvironmentProviders, type Type } from "@angular/core";
import { GC_ENVIRONMENT, type GcRuntimeEnvironment } from "../env/tokens";
import { PlayerMediaService } from "../media/player-media.service";
import { PlatformGamesService } from "../platform/platform-games.service";
import { PlatformSessionService } from "../platform/platform-session.service";
import { GameMembershipStore } from "./game-membership.store";
import {
  GAME_MEMBERSHIP_CONFIG,
  GAME_PLAYER_SHEET_API,
  type GameMembershipConfig,
  type GamePlayerSheetApi,
} from "./tokens";

export interface GameRemoteKernelOptions {
  environment: GcRuntimeEnvironment;
  membership: GameMembershipConfig;
  /** Typically the game's `PlayersService` (resolve + load). */
  playerSheetApi: Type<GamePlayerSheetApi>;
}

/**
 * Registers `GC_ENVIRONMENT` / membership tokens and the SDK services that depend on them.
 *
 * Call from the remote `app.config.ts` (standalone) **and** on the parent `providers` of the
 * exported federation routes — the Platform shell never runs the remote bootstrap.
 *
 * SDK services are **not** `providedIn: "root"` (host root has no game tokens). Game-owned
 * services that need the kernel must likewise be listed on those route `providers` only.
 *
 * `playerSheetApi` is registered here (not only via `useExisting`) so a playground `App` that
 * injects `GameMembershipStore` at root does not hit NG0201 before route providers load.
 */
export function provideGameRemoteKernel(options: GameRemoteKernelOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: GC_ENVIRONMENT, useValue: options.environment },
    { provide: GAME_MEMBERSHIP_CONFIG, useValue: options.membership },
    options.playerSheetApi,
    { provide: GAME_PLAYER_SHEET_API, useExisting: options.playerSheetApi },
    PlatformSessionService,
    PlatformGamesService,
    GameMembershipStore,
    PlayerMediaService,
  ]);
}
