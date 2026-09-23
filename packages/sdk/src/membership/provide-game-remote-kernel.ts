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
 * Registers tokens required by `BaseService`, `PlatformGamesService`, and `GameMembershipStore`.
 *
 * Call from the remote `app.config.ts` (standalone playground) **and** from the parent
 * `providers` of the exported federation routes. Under Module Federation the shell never runs
 * the remote bootstrap, and `providedIn: "root"` services resolve against the **host** root —
 * so this helper also re-provides the SDK services that need `GC_ENVIRONMENT` / membership
 * tokens, shadowing the empty host root for the remote route tree.
 *
 * Game-owned `BaseService` subclasses that use `providedIn: "root"` must likewise be listed on
 * those same route `providers` (see WoW / LoL `*Routes`).
 */
export function provideGameRemoteKernel(options: GameRemoteKernelOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: GC_ENVIRONMENT, useValue: options.environment },
    { provide: GAME_MEMBERSHIP_CONFIG, useValue: options.membership },
    { provide: GAME_PLAYER_SHEET_API, useExisting: options.playerSheetApi },
    PlatformSessionService,
    PlatformGamesService,
    GameMembershipStore,
    PlayerMediaService,
  ]);
}
