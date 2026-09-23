import { makeEnvironmentProviders, type EnvironmentProviders, type Type } from "@angular/core";
import { GC_ENVIRONMENT, type GcRuntimeEnvironment } from "../env/tokens";
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
 * Call once from the remote `app.config.ts`.
 */
export function provideGameRemoteKernel(options: GameRemoteKernelOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: GC_ENVIRONMENT, useValue: options.environment },
    { provide: GAME_MEMBERSHIP_CONFIG, useValue: options.membership },
    { provide: GAME_PLAYER_SHEET_API, useExisting: options.playerSheetApi },
  ]);
}
